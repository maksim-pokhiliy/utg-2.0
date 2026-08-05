import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RateLimitVerdict } from "@root/app/api/rate-limit";

const BASE_TIME = new Date("2026-01-01T00:00:00.000Z").getTime();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_MAX_CLIENTS = 1000;
const RATE_LIMIT_RETAINED_CLIENTS = 750;
const MAX_CLIENT_KEY_LENGTH = 45;

const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

const TRACKED_CLIENTS_AT_EVICTION = RATE_LIMIT_MAX_CLIENTS + 1;
const EVICTED_CLIENT_COUNT =
  TRACKED_CLIENTS_AT_EVICTION - RATE_LIMIT_RETAINED_CLIENTS;
const LAST_EVICTED_CLIENT_INDEX = EVICTED_CLIENT_COUNT - 1;
const FIRST_RETAINED_CLIENT_INDEX = EVICTED_CLIENT_COUNT;

const ATTEMPT_CEILING = RATE_LIMIT_MAX_REQUESTS + 1;

const DIRECTORY_MAX_REQUESTS = 60;
const DIRECTORY_ATTEMPT_CEILING = DIRECTORY_MAX_REQUESTS + 1;

const CLIENT_KEY = "203.0.113.5";
const PAIRED_CLIENT_KEY = "203.0.113.11";
const VICTIM_KEY = "victim";
const VETERAN_KEY = "veteran";
const FUTURE_HIT_OFFSET_MS = 120_000;
const BLOCKED_ATTEMPT_OFFSET_MS = 10_000;
const BLOCKED_ATTEMPT_COUNT = 3;
const WINDOW_EDGE_OFFSET_MS = RATE_LIMIT_WINDOW_MS - 1;

const PROMOTION_FILLER_COUNT = 998;
const POST_PROMOTION_FILLER_COUNT = 2;
const VETERAN_SPENT_REQUESTS = 2;

const REQUEST_URL = "https://example.test/api/place_order";
const OVERLONG_HEADER_VALUE = "b".repeat(MAX_CLIENT_KEY_LENGTH + 15);
const SLICED_HEADER_VALUE = "b".repeat(MAX_CLIENT_KEY_LENGTH);

const loadRateLimit = () => import("@root/app/api/rate-limit");

const clientKey = (index: number): string => `client-${index}`;

const buildRequest = (headers: Record<string, string>): Request =>
  new Request(REQUEST_URL, { headers });

const readRetryAfterSeconds = (verdict: RateLimitVerdict): number =>
  verdict.isAllowed ? Number.NaN : verdict.retryAfterSeconds;

const countAllowedBeforeBlock = (
  consume: (key: string | null) => RateLimitVerdict,
  key: string
): number => {
  let allowed = 0;

  for (let attempt = 0; attempt < ATTEMPT_CEILING; attempt += 1) {
    if (!consume(key).isAllowed) {
      return allowed;
    }

    allowed += 1;
  }

  return allowed;
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("consumeRateLimit", () => {
  it("allows the first five requests from one client", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    expect(countAllowedBeforeBlock(consumeRateLimit, CLIENT_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );
  });

  it("blocks the sixth request with a retry-after inside the window", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(CLIENT_KEY);
    }

    const verdict = consumeRateLimit(CLIENT_KEY);

    expect(verdict.isAllowed).toBe(false);
    expect(readRetryAfterSeconds(verdict)).toBeGreaterThanOrEqual(
      MIN_RETRY_AFTER_SECONDS
    );
    expect(readRetryAfterSeconds(verdict)).toBeLessThanOrEqual(
      MAX_RETRY_AFTER_SECONDS
    );
  });

  it("keeps blocking one millisecond before the window has fully elapsed", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(CLIENT_KEY);
    }

    vi.setSystemTime(BASE_TIME + RATE_LIMIT_WINDOW_MS - 1);

    expect(consumeRateLimit(CLIENT_KEY).isAllowed).toBe(false);
  });

  it("drops a hit that is exactly one window old because the bound is exclusive", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(CLIENT_KEY);
    }

    vi.setSystemTime(BASE_TIME + RATE_LIMIT_WINDOW_MS);

    expect(countAllowedBeforeBlock(consumeRateLimit, CLIENT_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );
  });

  it("does not extend the window when a request is blocked", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(CLIENT_KEY);
    }

    vi.setSystemTime(BASE_TIME + BLOCKED_ATTEMPT_OFFSET_MS);

    for (let attempt = 0; attempt < BLOCKED_ATTEMPT_COUNT; attempt += 1) {
      expect(consumeRateLimit(CLIENT_KEY).isAllowed).toBe(false);
    }

    vi.setSystemTime(BASE_TIME + RATE_LIMIT_WINDOW_MS + 1);

    expect(countAllowedBeforeBlock(consumeRateLimit, CLIENT_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );
  });

  it("ignores stored hits that sit in the future after the clock rolls back", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    vi.setSystemTime(BASE_TIME + FUTURE_HIT_OFFSET_MS);

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      expect(consumeRateLimit(CLIENT_KEY).isAllowed).toBe(true);
    }

    vi.setSystemTime(BASE_TIME);

    expect(countAllowedBeforeBlock(consumeRateLimit, CLIENT_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );
  });

  it("retains exactly 750 clients once a 1001st client is tracked, evicting the least recent first", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      expect(consumeRateLimit(VICTIM_KEY).isAllowed).toBe(true);
    }

    expect(consumeRateLimit(VICTIM_KEY).isAllowed).toBe(false);

    const blockedFillers: number[] = [];

    for (let index = 1; index <= RATE_LIMIT_MAX_CLIENTS; index += 1) {
      if (!consumeRateLimit(clientKey(index)).isAllowed) {
        blockedFillers.push(index);
      }
    }

    expect(blockedFillers).toEqual([]);

    expect(countAllowedBeforeBlock(consumeRateLimit, VICTIM_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );
    expect(
      countAllowedBeforeBlock(
        consumeRateLimit,
        clientKey(LAST_EVICTED_CLIENT_INDEX)
      )
    ).toBe(RATE_LIMIT_MAX_REQUESTS);
    expect(
      countAllowedBeforeBlock(
        consumeRateLimit,
        clientKey(FIRST_RETAINED_CLIENT_INDEX)
      )
    ).toBe(RATE_LIMIT_MAX_REQUESTS - 1);
  });

  it("promotes a returning client so the eviction takes the untouched keys instead", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    expect(consumeRateLimit(VETERAN_KEY).isAllowed).toBe(true);

    for (let index = 1; index <= PROMOTION_FILLER_COUNT; index += 1) {
      consumeRateLimit(clientKey(index));
    }

    expect(consumeRateLimit(VETERAN_KEY).isAllowed).toBe(true);

    for (let offset = 1; offset <= POST_PROMOTION_FILLER_COUNT; offset += 1) {
      consumeRateLimit(clientKey(PROMOTION_FILLER_COUNT + offset));
    }

    expect(countAllowedBeforeBlock(consumeRateLimit, VETERAN_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS - VETERAN_SPENT_REQUESTS
    );
  });

  it("never asks a blocked client to retry in under a second at the edge of the window", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(CLIENT_KEY);
    }

    vi.setSystemTime(BASE_TIME + WINDOW_EDGE_OFFSET_MS);

    const verdict = consumeRateLimit(CLIENT_KEY);

    expect(verdict.isAllowed).toBe(false);
    expect(readRetryAfterSeconds(verdict)).toBe(MIN_RETRY_AFTER_SECONDS);
  });

  it("fails open for a null client key so an unidentifiable order is never dropped", async () => {
    const { consumeRateLimit } = await loadRateLimit();

    const verdicts: boolean[] = [];

    for (let attempt = 0; attempt < ATTEMPT_CEILING; attempt += 1) {
      verdicts.push(consumeRateLimit(null).isAllowed);
    }

    expect(verdicts).toEqual(Array(ATTEMPT_CEILING).fill(true));
  });
});

describe("resolveClientKey", () => {
  it("reads the first forwarded-for hop", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({
      "x-forwarded-for": "203.0.113.5 , 198.51.100.7",
    });

    expect(resolveClientKey(request)).toBe("203.0.113.5");
  });

  it("reads a single forwarded-for value that carries no separator", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({ "x-forwarded-for": "203.0.113.9" });

    expect(resolveClientKey(request)).toBe("203.0.113.9");
  });

  it("slices an overlong forwarded-for hop to 45 characters", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({ "x-forwarded-for": OVERLONG_HEADER_VALUE });

    expect(resolveClientKey(request)).toBe(SLICED_HEADER_VALUE);
  });

  it("falls back to the real-ip header when forwarded-for is blank", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({
      "x-forwarded-for": " ",
      "x-real-ip": "198.51.100.23",
    });

    expect(resolveClientKey(request)).toBe("198.51.100.23");
  });

  it("falls back to the real-ip header when forwarded-for is absent", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({ "x-real-ip": "198.51.100.23" });

    expect(resolveClientKey(request)).toBe("198.51.100.23");
  });

  it("slices an overlong real-ip value to 45 characters", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({ "x-real-ip": OVERLONG_HEADER_VALUE });

    expect(resolveClientKey(request)).toBe(SLICED_HEADER_VALUE);
  });

  it("returns null when no identity header is present", async () => {
    const { resolveClientKey } = await loadRateLimit();

    expect(resolveClientKey(buildRequest({}))).toBeNull();
  });

  it("returns null when both identity headers are blank", async () => {
    const { resolveClientKey } = await loadRateLimit();

    const request = buildRequest({
      "x-forwarded-for": " ",
      "x-real-ip": " ",
    });

    expect(resolveClientKey(request)).toBeNull();
  });
});

describe("consumeDirectoryRateLimit", () => {
  it("allows sixty lookups and blocks the sixty-first with a retry-after inside the window", async () => {
    const { consumeDirectoryRateLimit } = await loadRateLimit();

    const verdicts: boolean[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      verdicts.push(consumeDirectoryRateLimit(CLIENT_KEY).isAllowed);
    }

    const blocked = consumeDirectoryRateLimit(CLIENT_KEY);

    expect(verdicts).toEqual(Array(DIRECTORY_MAX_REQUESTS).fill(true));
    expect(blocked.isAllowed).toBe(false);
    expect(readRetryAfterSeconds(blocked)).toBeGreaterThanOrEqual(
      MIN_RETRY_AFTER_SECONDS
    );
    expect(readRetryAfterSeconds(blocked)).toBeLessThanOrEqual(
      MAX_RETRY_AFTER_SECONDS
    );
  });

  it("fails open for a null client key so an unidentifiable lookup is never dropped", async () => {
    const { consumeDirectoryRateLimit } = await loadRateLimit();

    const verdicts: boolean[] = [];

    for (let attempt = 0; attempt < DIRECTORY_ATTEMPT_CEILING; attempt += 1) {
      verdicts.push(consumeDirectoryRateLimit(null).isAllowed);
    }

    expect(verdicts).toEqual(Array(DIRECTORY_ATTEMPT_CEILING).fill(true));
  });

  it("spends a budget that is independent of the order budget for the same client key", async () => {
    const { consumeRateLimit, consumeDirectoryRateLimit } =
      await loadRateLimit();

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      consumeDirectoryRateLimit(CLIENT_KEY);
    }

    expect(consumeDirectoryRateLimit(CLIENT_KEY).isAllowed).toBe(false);
    expect(countAllowedBeforeBlock(consumeRateLimit, CLIENT_KEY)).toBe(
      RATE_LIMIT_MAX_REQUESTS
    );

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      consumeRateLimit(PAIRED_CLIENT_KEY);
    }

    const directoryVerdicts: boolean[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      directoryVerdicts.push(
        consumeDirectoryRateLimit(PAIRED_CLIENT_KEY).isAllowed
      );
    }

    expect(consumeRateLimit(PAIRED_CLIENT_KEY).isAllowed).toBe(false);
    expect(directoryVerdicts).toEqual(Array(DIRECTORY_MAX_REQUESTS).fill(true));
  });
});
