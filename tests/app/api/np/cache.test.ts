import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

const BASE_TIME = new Date("2026-01-01T00:00:00.000Z").getTime();

const TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 30_000;
const MAX_ENTRIES = 3;
const ELAPSED_PAST_TTL_MS = TTL_MS * 2;

const FIRST_KEY = "kyiv";
const SECOND_KEY = "lviv";
const THIRD_KEY = "odesa";
const FOURTH_KEY = "dnipro";

const FIRST_VALUE = "first";
const SECOND_VALUE = "second";
const EMPTY_VALUE = "";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const BARE_QUERY = "a|b";
const SPLIT_CITY_REF = `${CITY_REF}|a`;
const SPLIT_QUERY = "b";
const AMBIGUOUS_SPLITS: readonly (readonly [string, string])[] = [
  ["", "a|b|c"],
  ["a", "b|c"],
  ["a|b", "c"],
  ["a|b|c", ""],
];

const LOADER_ERROR_MESSAGE = "the directory loader exploded";
const REJECTED_STATUS = "rejected";
const RELOADED_CALL_COUNT = 2;

type Loader = () => Promise<string | null>;

interface LoaderGate {
  promise: Promise<string | null>;
  release: (value: string | null) => void;
}

const unhandledRejections: unknown[] = [];

const captureRejection = (reason: unknown): void => {
  unhandledRejections.push(reason);
};

const loadCache = () => import("@root/app/api/np/cache");

const stubLoader = (value: string | null): Mock<Loader> =>
  vi.fn<Loader>(() => Promise.resolve(value));

const failingLoader = (): Mock<Loader> =>
  vi.fn<Loader>(() => Promise.reject(new Error(LOADER_ERROR_MESSAGE)));

const createLoaderGate = (): LoaderGate => {
  let settle: (value: string | null) => void = () => undefined;

  const promise = new Promise<string | null>((resolve) => {
    settle = resolve;
  });

  return {
    promise,
    release: (value) => {
      settle(value);
    },
  };
};

const flushPendingRejections = async (): Promise<void> => {
  vi.useRealTimers();

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
  vi.resetModules();
  unhandledRejections.length = 0;
  process.on("unhandledRejection", captureRejection);
});

afterEach(() => {
  process.off("unhandledRejection", captureRejection);
  vi.useRealTimers();
});

describe("createDirectoryCache", () => {
  it("serves the cached value while the ttl has not elapsed", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });
    const load = stubLoader(FIRST_VALUE);

    await cache.resolve(FIRST_KEY, load);
    vi.setSystemTime(BASE_TIME + TTL_MS - 1);

    const value = await cache.resolve(FIRST_KEY, load);

    expect(value).toBe(FIRST_VALUE);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads when the clock reaches the expiry instant exactly", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });

    await cache.resolve(FIRST_KEY, stubLoader(FIRST_VALUE));
    vi.setSystemTime(BASE_TIME + TTL_MS);

    const reload = stubLoader(SECOND_VALUE);
    const value = await cache.resolve(FIRST_KEY, reload);

    expect(value).toBe(SECOND_VALUE);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads long after the ttl has elapsed", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });

    await cache.resolve(FIRST_KEY, stubLoader(FIRST_VALUE));
    vi.setSystemTime(BASE_TIME + ELAPSED_PAST_TTL_MS);

    const reload = stubLoader(SECOND_VALUE);

    await cache.resolve(FIRST_KEY, reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("evicts the oldest entry when a write exceeds the entry cap", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });

    await cache.resolve(FIRST_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(SECOND_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(THIRD_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(FOURTH_KEY, stubLoader(FIRST_VALUE));

    const retainedReload = stubLoader(SECOND_VALUE);
    const evictedReload = stubLoader(SECOND_VALUE);

    await cache.resolve(SECOND_KEY, retainedReload);
    await cache.resolve(FIRST_KEY, evictedReload);

    expect(retainedReload).not.toHaveBeenCalled();
    expect(evictedReload).toHaveBeenCalledTimes(1);
  });

  it("protects an entry that was read between two writes", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });

    await cache.resolve(FIRST_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(SECOND_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(THIRD_KEY, stubLoader(FIRST_VALUE));
    await cache.resolve(FIRST_KEY, stubLoader(SECOND_VALUE));
    await cache.resolve(FOURTH_KEY, stubLoader(FIRST_VALUE));

    const promotedReload = stubLoader(SECOND_VALUE);
    const evictedReload = stubLoader(SECOND_VALUE);

    await cache.resolve(FIRST_KEY, promotedReload);
    await cache.resolve(SECOND_KEY, evictedReload);

    expect(promotedReload).not.toHaveBeenCalled();
    expect(evictedReload).toHaveBeenCalledTimes(1);
  });

  it("invokes the loader once for two concurrent resolves of a cold key", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });
    const gate = createLoaderGate();
    const load = vi.fn<Loader>(() => gate.promise);

    const first = cache.resolve(FIRST_KEY, load);
    const second = cache.resolve(FIRST_KEY, load);

    gate.release(FIRST_VALUE);

    expect(await first).toBe(FIRST_VALUE);
    expect(await second).toBe(FIRST_VALUE);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("propagates a null result without caching it", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });
    const failing = stubLoader(null);
    const recovering = stubLoader(FIRST_VALUE);

    const missing = await cache.resolve(FIRST_KEY, failing);
    const recovered = await cache.resolve(FIRST_KEY, recovering);

    expect(missing).toBeNull();
    expect(recovered).toBe(FIRST_VALUE);
    expect(recovering).toHaveBeenCalledTimes(1);
  });

  it("serves a remembered failure without re-invoking the loader inside the negative ttl", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
      negativeTtlMs: NEGATIVE_TTL_MS,
    });
    const failing = stubLoader(null);
    const unusedReload = stubLoader(FIRST_VALUE);

    const missing = await cache.resolve(FIRST_KEY, failing);

    vi.setSystemTime(BASE_TIME + NEGATIVE_TTL_MS - 1);

    const remembered = await cache.resolve(FIRST_KEY, unusedReload);

    expect(missing).toBeNull();
    expect(remembered).toBeNull();
    expect(failing).toHaveBeenCalledTimes(1);
    expect(unusedReload).not.toHaveBeenCalled();
  });

  it("replaces a remembered failure with a real value once the negative ttl elapses", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
      negativeTtlMs: NEGATIVE_TTL_MS,
    });

    await cache.resolve(FIRST_KEY, stubLoader(null));
    vi.setSystemTime(BASE_TIME + NEGATIVE_TTL_MS);

    const recovering = stubLoader(FIRST_VALUE);
    const recovered = await cache.resolve(FIRST_KEY, recovering);

    vi.setSystemTime(BASE_TIME + NEGATIVE_TTL_MS + 1);

    const unusedReload = stubLoader(SECOND_VALUE);
    const warmed = await cache.resolve(FIRST_KEY, unusedReload);

    expect(recovered).toBe(FIRST_VALUE);
    expect(recovering).toHaveBeenCalledTimes(1);
    expect(warmed).toBe(FIRST_VALUE);
    expect(unusedReload).not.toHaveBeenCalled();
  });

  it("clears the in-flight entry when the loader rejects", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });
    const failing = failingLoader();

    await expect(cache.resolve(FIRST_KEY, failing)).rejects.toThrow(
      LOADER_ERROR_MESSAGE
    );

    const recovering = stubLoader(FIRST_VALUE);
    const recovered = await cache.resolve(FIRST_KEY, recovering);

    expect(recovered).toBe(FIRST_VALUE);
    expect(failing).toHaveBeenCalledTimes(1);
    expect(recovering).toHaveBeenCalledTimes(1);

    await flushPendingRejections();

    expect(unhandledRejections).toEqual([]);
  });

  it("rejects every joined resolve when the shared loader rejects", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
    });
    const failing = failingLoader();

    const first = cache.resolve(FIRST_KEY, failing);
    const second = cache.resolve(FIRST_KEY, failing);
    const settled = await Promise.allSettled([first, second]);

    expect(settled.map((outcome) => outcome.status)).toEqual([
      REJECTED_STATUS,
      REJECTED_STATUS,
    ]);
    expect(failing).toHaveBeenCalledTimes(1);

    await flushPendingRejections();

    expect(unhandledRejections).toEqual([]);
  });

  it("stores nothing when the cacheability predicate rejects every value", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
      isCacheable: () => false,
    });
    const load = stubLoader(FIRST_VALUE);

    await cache.resolve(FIRST_KEY, load);
    await cache.resolve(FIRST_KEY, load);

    expect(load).toHaveBeenCalledTimes(RELOADED_CALL_COUNT);
  });

  it("caches only the values the predicate accepts", async () => {
    const { createDirectoryCache } = await loadCache();
    const cache = createDirectoryCache<string>({
      ttlMs: TTL_MS,
      maxEntries: MAX_ENTRIES,
      isCacheable: (value) => value !== EMPTY_VALUE,
    });

    await cache.resolve(FIRST_KEY, stubLoader(EMPTY_VALUE));
    await cache.resolve(FIRST_KEY, stubLoader(FIRST_VALUE));

    const unusedReload = stubLoader(SECOND_VALUE);
    const value = await cache.resolve(FIRST_KEY, unusedReload);

    expect(value).toBe(FIRST_VALUE);
    expect(unusedReload).not.toHaveBeenCalled();
  });
});

describe("composeCacheKey", () => {
  it("keeps two component pairs apart when a component carries the separator itself", async () => {
    const { composeCacheKey } = await loadCache();

    expect(composeCacheKey(SPLIT_CITY_REF, BARE_QUERY)).not.toBe(
      composeCacheKey(CITY_REF, SPLIT_QUERY)
    );
  });

  it("keeps every ambiguous split of one joined spelling apart", async () => {
    const { composeCacheKey } = await loadCache();
    const keys = AMBIGUOUS_SPLITS.map(([city, query]) =>
      composeCacheKey(city, query)
    );

    expect(new Set(keys).size).toBe(AMBIGUOUS_SPLITS.length);
  });

  it("gives one component pair one key", async () => {
    const { composeCacheKey } = await loadCache();

    expect(composeCacheKey(CITY_REF, BARE_QUERY)).toBe(
      composeCacheKey(CITY_REF, BARE_QUERY)
    );
  });
});
