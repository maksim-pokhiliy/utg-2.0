import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { NextRequest } from "next/server";

import { RELAY_REQUEST_TIMEOUT_MS } from "@root/app/api/place_order/relay";

import type { FetchStub } from "../../../support/apiTest";
import { expectUpstreamOnly, stubUpstream } from "../../../support/apiTest";

const ROUTE_URL = "https://example.test/api/place_order";
const FAKE_RELAY_ORIGIN = "https://relay.invalid";
const RELAY_HOST = "relay.invalid";
const UPSTREAM_URL = `${FAKE_RELAY_ORIGIN}/place_order`;

const CLIENT_IP = "203.0.113.5";

const RATE_LIMIT_MAX_REQUESTS = 5;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

const EXPECTED_TIMEOUT_MS = 20_000;
const SHORT_DEADLINE_MS = 40;
const MAX_DURATION_SECONDS = 25;
const MS_PER_SECOND = 1000;
const MAX_ORDER_BODY_BYTES = 65_536;

const CONTENT_TYPE_HEADER = "Content-Type";
const NOSNIFF_HEADER = "X-Content-Type-Options";
const NOSNIFF_VALUE = "nosniff";
const JSON_CONTENT_TYPE = "application/json";
const JSON_UPSTREAM_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };
const PLAIN_UPSTREAM_HEADERS = {
  [CONTENT_TYPE_HEADER]: "text/plain; charset=utf-8",
};

const ACCEPTED_STATUS = 200;
const MIRRORED_ACCEPTED_STATUS = 202;
const REJECTED_STATUS = 422;
const NO_CONTENT_STATUS = 204;
const NOT_CONFIGURED_STATUS = 503;
const FAILED_STATUS = 500;
const PAYLOAD_TOO_LARGE_STATUS = 413;
const GATEWAY_TIMEOUT_STATUS = 504;
const TOO_MANY_REQUESTS_STATUS = 429;

const NOT_CONFIGURED_BODY = '{"error":"Order service is not configured"}';
const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const FAILED_BODY = '{"error":"Failed to place order"}';
const SUBSTITUTE_BODY = "{}";
const UPSTREAM_ACCEPTED_BODY = '{"status":"success","orderId":"77"}';
const REJECTED_UPSTREAM_BODY = "order rejected";

const TIMEOUT_ERROR_NAME = "TimeoutError";
const TIMEOUT_ERROR_MESSAGE = "The operation was aborted due to timeout";

const RELAY_SECRET_NAME = "ORDER_RELAY_SECRET";
const RELAY_SECRET = "s3cret-relay-token";
const PADDED_RELAY_SECRET = `  ${RELAY_SECRET}  `;
const BLANK_RELAY_SECRETS = ["", "   "] as const;
const UNSENDABLE_RELAY_SECRETS = [
  `${RELAY_SECRET}\nx-injected: 1`,
  `${RELAY_SECRET}\rx-injected: 1`,
  "секрет-реле",
  "café-token",
] as const;
const SENDABLE_RELAY_SECRETS = [
  "aGVsbG8+d29ybGQ/cmVsYXk==",
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.foo-bar_baz",
  "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "pass phrase with spaces ~ and !punctuation!",
] as const;

const RELAY_ORIGINS: readonly (readonly [string, string])[] = [
  [FAKE_RELAY_ORIGIN, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}/`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}//`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}///`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}\\`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}?q=1`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}#fragment`, UPSTREAM_URL],
  [`${FAKE_RELAY_ORIGIN}/api`, `${FAKE_RELAY_ORIGIN}/api/place_order`],
  [`${FAKE_RELAY_ORIGIN}/api/`, `${FAKE_RELAY_ORIGIN}/api/place_order`],
];

const UNUSABLE_RELAY_ORIGINS = [
  "relay.invalid",
  "/place_order",
  "not a url at all",
] as const;

const AUTHENTICATED_HEADERS = {
  "Content-Type": "application/json",
  "x-relay-secret": RELAY_SECRET,
};

const ORDER_PAYLOAD = {
  first_name: "John",
  total: "1200.00",
  cart: [{ title: "«Waiting»", quantity: 2 }],
};

const OVERSIZED_ORDER_BODY = JSON.stringify({
  padding: "x".repeat(MAX_ORDER_BODY_BYTES),
});

const MULTIBYTE_PAYLOAD = {
  first_name: "Олександра",
  comment: "«Waiting» · Мультибайтовий коментар",
  cart: [{ title: "Набір із «Waiting, Welcome, Death» · XXL", quantity: 3 }],
};

type StreamedInit = NonNullable<
  ConstructorParameters<typeof NextRequest>[1]
> & { duplex: "half" };

interface TimeoutRecorder {
  delays: number[];
  signals: AbortSignal[];
}

interface SealedAnswer {
  label: string;
  status: number;
  arrange: () => void;
}

const loadRoute = () => import("@root/app/api/place_order/route");

const buildRequestHeaders = (): Record<string, string> => ({
  "content-type": "application/json",
  "x-forwarded-for": CLIENT_IP,
});

const buildOrderRequest = (): NextRequest =>
  new NextRequest(ROUTE_URL, {
    method: "POST",
    headers: buildRequestHeaders(),
    body: JSON.stringify(ORDER_PAYLOAD),
  });

const buildRawRequest = (body: string): NextRequest =>
  new NextRequest(ROUTE_URL, {
    method: "POST",
    headers: buildRequestHeaders(),
    body,
  });

const buildSplitRequest = (payload: unknown): NextRequest => {
  const text = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(text);
  const splitAt = bytes.indexOf(0xd0) + 1;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, splitAt));
      controller.enqueue(bytes.slice(splitAt));
      controller.close();
    },
  });

  const init: StreamedInit = {
    method: "POST",
    headers: buildRequestHeaders(),
    body: stream,
    duplex: "half",
  };

  return new NextRequest(ROUTE_URL, init);
};

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

const upstreamResponse = (
  body: string | null,
  status: number,
  headers?: Record<string, string>
) => Promise.resolve(new Response(body, { status, headers }));

const stubAcceptedUpstream = () =>
  stubUpstream(() =>
    upstreamResponse(UPSTREAM_ACCEPTED_BODY, ACCEPTED_STATUS, {
      ...JSON_UPSTREAM_HEADERS,
    })
  );

const readSignal = (
  fetchStub: Mock<FetchStub>,
  index: number
): AbortSignal | null | undefined => fetchStub.mock.calls[index]?.[1]?.signal;

const readSentBody = (
  fetchStub: Mock<FetchStub>,
  index: number
): BodyInit | null | undefined => fetchStub.mock.calls[index]?.[1]?.body;

const recordTimeoutSignals = (deadlineMs?: number): TimeoutRecorder => {
  const recorder: TimeoutRecorder = { delays: [], signals: [] };
  const realTimeout = AbortSignal.timeout.bind(AbortSignal);

  vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    const signal = realTimeout(deadlineMs ?? milliseconds);

    recorder.delays.push(milliseconds);
    recorder.signals.push(signal);

    return signal;
  });

  return recorder;
};

const SEALED_ANSWERS: readonly SealedAnswer[] = [
  {
    label: "unconfigured",
    status: NOT_CONFIGURED_STATUS,
    arrange: () => {
      vi.stubEnv("PLACE_ORDER_URL", undefined);
      stubUpstream(() => upstreamResponse(null, ACCEPTED_STATUS));
    },
  },
  {
    label: "accepted",
    status: ACCEPTED_STATUS,
    arrange: () => {
      stubAcceptedUpstream();
    },
  },
  {
    label: "rejected",
    status: REJECTED_STATUS,
    arrange: () => {
      stubUpstream(() =>
        upstreamResponse(REJECTED_UPSTREAM_BODY, REJECTED_STATUS, {
          ...PLAIN_UPSTREAM_HEADERS,
        })
      );
    },
  },
  {
    label: "empty",
    status: NO_CONTENT_STATUS,
    arrange: () => {
      stubUpstream(() => upstreamResponse(null, NO_CONTENT_STATUS));
    },
  },
  {
    label: "broken",
    status: FAILED_STATUS,
    arrange: () => {
      stubUpstream(() =>
        Promise.reject(new Error(`connect ECONNREFUSED ${RELAY_HOST}`))
      );
    },
  },
];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("PLACE_ORDER_URL", FAKE_RELAY_ORIGIN);
  vi.stubEnv(RELAY_SECRET_NAME, undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/place_order", () => {
  it("answers 503 without touching the body when the relay is not configured", async () => {
    vi.stubEnv("PLACE_ORDER_URL", undefined);

    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const fetchStub = stubUpstream(() =>
      upstreamResponse(null, ACCEPTED_STATUS)
    );
    const { POST } = await loadRoute();
    const request = buildOrderRequest();

    const response = await POST(request);

    expect(response.status).toBe(NOT_CONFIGURED_STATUS);
    expect(await response.text()).toBe(NOT_CONFIGURED_BODY);
    expect(request.bodyUsed).toBe(false);
    expect(fetchStub).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it.each(UNUSABLE_RELAY_ORIGINS)(
    "answers 503 without touching the body when the configured relay address cannot be parsed: %j",
    async (origin) => {
      vi.stubEnv("PLACE_ORDER_URL", origin);

      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();
      const request = buildOrderRequest();

      const response = await POST(request);

      expect(response.status).toBe(NOT_CONFIGURED_STATUS);
      expect(await response.text()).toBe(NOT_CONFIGURED_BODY);
      expect(request.bodyUsed).toBe(false);
      expect(fetchStub).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    }
  );

  it.each(RELAY_ORIGINS)(
    "resolves the configured relay address %j to the order endpoint at %j",
    async (origin, expected) => {
      vi.stubEnv("PLACE_ORDER_URL", origin);

      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();

      await POST(buildOrderRequest());

      expect(fetchStub).toHaveBeenCalledTimes(1);
      expectUpstreamOnly(fetchStub.mock.calls, expected);
    }
  );

  it("answers 429 with a Retry-After header, and no body read, on the sixth request from one client", async () => {
    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const allowedStatuses: number[] = [];

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      const allowed = await POST(buildOrderRequest());

      allowedStatuses.push(allowed.status);
    }

    const blockedRequest = buildOrderRequest();
    const blocked = await POST(blockedRequest);

    expect(allowedStatuses).toEqual(
      Array(RATE_LIMIT_MAX_REQUESTS).fill(ACCEPTED_STATUS)
    );
    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);
    expect(blockedRequest.bodyUsed).toBe(false);

    const retryAfter = Number(blocked.headers.get("Retry-After"));

    expect(retryAfter).toBeGreaterThanOrEqual(MIN_RETRY_AFTER_SECONDS);
    expect(retryAfter).toBeLessThanOrEqual(MAX_RETRY_AFTER_SECONDS);

    expect(fetchStub).toHaveBeenCalledTimes(RATE_LIMIT_MAX_REQUESTS);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("posts the order payload to the configured relay unchanged, and does read the body to do it", async () => {
    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();
    const request = buildOrderRequest();

    await POST(request);

    expect(request.bodyUsed).toBe(true);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ORDER_PAYLOAD),
      signal: expect.any(AbortSignal),
    });
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("rebuilds an order whose bytes arrive split across a multibyte character", async () => {
    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const response = await POST(buildSplitRequest(MULTIBYTE_PAYLOAD));

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(readSentBody(fetchStub, 0)).toBe(JSON.stringify(MULTIBYTE_PAYLOAD));
  });

  it("answers 413 without calling the relay when the order body runs past the accepted size", async () => {
    silenceErrorLog();

    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const response = await POST(buildRawRequest(OVERSIZED_ORDER_BODY));

    expect(OVERSIZED_ORDER_BODY.length).toBeGreaterThan(MAX_ORDER_BODY_BYTES);
    expect(response.status).toBe(PAYLOAD_TOO_LARGE_STATUS);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("still forwards an order that sits just under the accepted size", async () => {
    const padding = "y".repeat(MAX_ORDER_BODY_BYTES / 2);
    const body = JSON.stringify({ ...ORDER_PAYLOAD, padding });
    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const response = await POST(buildRawRequest(body));

    expect(body.length).toBeLessThan(MAX_ORDER_BODY_BYTES);
    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(readSentBody(fetchStub, 0)).toBe(body);
  });

  it("answers 500 without calling the relay when the checkout body is not json", async () => {
    silenceErrorLog();

    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const response = await POST(buildRawRequest("not json at all"));

    expect(response.status).toBe(FAILED_STATUS);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("presents the x-relay-secret header when a relay secret is configured", async () => {
    vi.stubEnv(RELAY_SECRET_NAME, RELAY_SECRET);

    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    await POST(buildOrderRequest());

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
      method: "POST",
      redirect: "error",
      headers: AUTHENTICATED_HEADERS,
      body: JSON.stringify(ORDER_PAYLOAD),
      signal: expect.any(AbortSignal),
    });
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("keeps presenting the secret on a second order served by the same warm module", async () => {
    vi.stubEnv(RELAY_SECRET_NAME, RELAY_SECRET);

    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    const first = await POST(buildOrderRequest());
    const second = await POST(buildOrderRequest());

    expect(first.status).toBe(ACCEPTED_STATUS);
    expect(second.status).toBe(ACCEPTED_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(fetchStub.mock.calls[0]?.[1]?.headers).toEqual(
      AUTHENTICATED_HEADERS
    );
    expect(fetchStub.mock.calls[1]?.[1]?.headers).toEqual(
      AUTHENTICATED_HEADERS
    );
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it.each(UNSENDABLE_RELAY_SECRETS)(
    "answers 503 without touching the body, calling the relay or logging the value when the relay secret cannot ride a header: %j",
    async (secret) => {
      vi.stubEnv(RELAY_SECRET_NAME, secret);

      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();
      const request = buildOrderRequest();

      const response = await POST(request);

      expect(response.status).toBe(NOT_CONFIGURED_STATUS);
      expect(await response.text()).toBe(NOT_CONFIGURED_BODY);
      expect(request.bodyUsed).toBe(false);
      expect(fetchStub).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls.flat().map(String).join(" ")).not.toContain(
        secret
      );
    }
  );

  it.each(SENDABLE_RELAY_SECRETS)(
    "presents a realistically shaped relay secret unchanged: %j",
    async (secret) => {
      vi.stubEnv(RELAY_SECRET_NAME, secret);

      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();

      await POST(buildOrderRequest());

      expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
        method: "POST",
        redirect: "error",
        headers: {
          "Content-Type": "application/json",
          "x-relay-secret": secret,
        },
        body: JSON.stringify(ORDER_PAYLOAD),
        signal: expect.any(AbortSignal),
      });
      expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
    }
  );

  it("strips the padding around a configured relay secret", async () => {
    vi.stubEnv(RELAY_SECRET_NAME, PADDED_RELAY_SECRET);

    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();

    await POST(buildOrderRequest());

    expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
      method: "POST",
      redirect: "error",
      headers: AUTHENTICATED_HEADERS,
      body: JSON.stringify(ORDER_PAYLOAD),
      signal: expect.any(AbortSignal),
    });
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it.each(BLANK_RELAY_SECRETS)(
    "sends no x-relay-secret header, and says so, when the relay secret is %j",
    async (secret) => {
      vi.stubEnv(RELAY_SECRET_NAME, secret);

      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();

      await POST(buildOrderRequest());

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ORDER_PAYLOAD),
        signal: expect.any(AbortSignal),
      });
      expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
    }
  );

  it("mirrors the relay's accepted status but answers with our own json body, never the relay's", async () => {
    const fetchStub = stubUpstream(() =>
      upstreamResponse(UPSTREAM_ACCEPTED_BODY, MIRRORED_ACCEPTED_STATUS, {
        [CONTENT_TYPE_HEADER]: "application/json; charset=utf-8",
      })
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(MIRRORED_ACCEPTED_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(body).toBe(SUBSTITUTE_BODY);
    expect(body).not.toContain("orderId");
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("mirrors a relay rejection but re-emits neither its media type nor its bytes", async () => {
    const fetchStub = stubUpstream(() =>
      upstreamResponse(REJECTED_UPSTREAM_BODY, REJECTED_STATUS, {
        ...PLAIN_UPSTREAM_HEADERS,
      })
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(REJECTED_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(body).toBe(SUBSTITUTE_BODY);
    expect(body).not.toContain(REJECTED_UPSTREAM_BODY);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("answers with a null body when the upstream answers 204", async () => {
    const fetchStub = stubUpstream(() =>
      upstreamResponse(null, NO_CONTENT_STATUS)
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(NO_CONTENT_STATUS);
    expect(response.body).toBeNull();
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("answers 500 without leaking the relay when the upstream throws", async () => {
    silenceErrorLog();

    const fetchStub = stubUpstream(() =>
      Promise.reject(new Error(`connect ECONNREFUSED ${RELAY_HOST}`))
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(FAILED_STATUS);
    expect(body).toBe(FAILED_BODY);
    expect(body).not.toContain("details");
    expect(body).not.toContain(RELAY_HOST);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("pins the forward deadline at twenty seconds", async () => {
    expect(RELAY_REQUEST_TIMEOUT_MS).toBe(EXPECTED_TIMEOUT_MS);
  });

  it("declares a maxDuration the forward deadline can never outlast, so the platform never kills a buyer's order first", async () => {
    const { maxDuration } = await loadRoute();

    expect(maxDuration).toBe(MAX_DURATION_SECONDS);
    expect(maxDuration * MS_PER_SECOND).toBeGreaterThan(
      RELAY_REQUEST_TIMEOUT_MS
    );
  });

  it("hands fetch the deadline the relay module declares, so a hung relay can never hold the checkout open", async () => {
    const recorder = recordTimeoutSignals();

    let abortedOnEntry = true;

    const fetchStub = stubUpstream((_input, init) => {
      abortedOnEntry = init?.signal?.aborted ?? true;

      return upstreamResponse(UPSTREAM_ACCEPTED_BODY, ACCEPTED_STATUS, {
        ...JSON_UPSTREAM_HEADERS,
      });
    });
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());
    const signal = readSignal(fetchStub, 0);

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(abortedOnEntry).toBe(false);
    expect(recorder.delays).toEqual([RELAY_REQUEST_TIMEOUT_MS]);
    expect(signal).toBe(recorder.signals[0]);
  });

  it("never links the buyer's own abort to an order already on the wire", async () => {
    const recorder = recordTimeoutSignals();
    const fetchStub = stubAcceptedUpstream();
    const { POST } = await loadRoute();
    const request = buildOrderRequest();

    await POST(request);

    const signal = readSignal(fetchStub, 0);

    expect(signal).toBe(recorder.signals[0]);
    expect(signal).not.toBe(request.signal);
  });

  it("answers 504 when the relay takes longer than the deadline to say anything", async () => {
    silenceErrorLog();

    const recorder = recordTimeoutSignals(SHORT_DEADLINE_MS);
    const fetchStub = stubUpstream(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException(TIMEOUT_ERROR_MESSAGE, TIMEOUT_ERROR_NAME));
          });
        })
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(GATEWAY_TIMEOUT_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(recorder.delays).toEqual([RELAY_REQUEST_TIMEOUT_MS]);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it.each(SEALED_ANSWERS)(
    "seals its $label answer as json with nosniff",
    async ({ status, arrange }) => {
      silenceErrorLog();
      arrange();

      const { POST } = await loadRoute();
      const response = await POST(buildOrderRequest());

      expect(response.status).toBe(status);
      expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
      expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    }
  );

  it("leaves the rate limiter's own 429 unsealed, which belongs to the limiter's decision, not this route's", async () => {
    stubAcceptedUpstream();

    const { POST } = await loadRoute();

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      await POST(buildOrderRequest());
    }

    const blocked = await POST(buildOrderRequest());

    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(blocked.headers.get(CONTENT_TYPE_HEADER)).toContain(
      JSON_CONTENT_TYPE
    );
    expect(blocked.headers.get(NOSNIFF_HEADER)).toBeNull();
  });
});
