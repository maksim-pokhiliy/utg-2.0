import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

import { RELAY_REQUEST_TIMEOUT_MS } from "@root/app/api/place_order/relay";

import {
  SILENCE,
  closeLocalRelays,
  dripWith,
  pumpWith,
  replyWith,
  trackLocalRelay,
} from "../../../support/localRelay";

const ROUTE_URL = "https://example.test/api/place_order";
const CLIENT_IP = "203.0.113.11";
const RELAY_SECRET = "s3cret-relay-token";

const SHORT_DEADLINE_MS = 40;

const JSON_CONTENT_TYPE = "application/json";
const PLAIN_CONTENT_TYPE = "text/plain; charset=utf-8";
const NOSNIFF_HEADER = "X-Content-Type-Options";
const NOSNIFF_VALUE = "nosniff";
const CONTENT_TYPE_HEADER = "Content-Type";

const JSON_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };
const PLAIN_HEADERS = { [CONTENT_TYPE_HEADER]: PLAIN_CONTENT_TYPE };

const RELAY_OWN_HEADERS = {
  ...JSON_HEADERS,
  "X-Powered-By": "relay",
  "Set-Cookie": "relay_session=abc; Path=/",
  "X-Relay-Echo": "leaked",
};
const RELAY_OWN_HEADER_NAMES = [
  "x-powered-by",
  "set-cookie",
  "x-relay-echo",
] as const;

const ACCEPTED_STATUS = 200;
const REJECTED_STATUS = 422;
const RESET_CONTENT_STATUS = 205;
const UNCARRIABLE_STATUS = 999;
const FAILED_STATUS = 500;
const GATEWAY_TIMEOUT_STATUS = 504;

const ACCEPTED_BODY = '{"status":"success","orderId":"77"}';
const REJECTED_BODY = "order rejected";
const SUBSTITUTE_BODY = "{}";
const FAILED_BODY = '{"error":"Failed to place order"}';
const DRIPPED_HEAD = '{"status":';

const PUMP_CHUNK_BYTES = 64 * 1024;
const PUMP_TOTAL_BYTES = 4 * 1024 * 1024;
const PUMP_CHUNK = "x".repeat(PUMP_CHUNK_BYTES);
const PUMP_SETTLE_MS = 150;

const RELAY_PATH = "/place_order";
const SINGLE_REQUEST = 1;

const ORDER_PAYLOAD = {
  first_name: "John",
  last_name: "Smith",
  total: "1200.00",
  cart: [{ title: "«Waiting» · L", quantity: 2 }],
};

interface TimeoutRecorder {
  delays: number[];
}

const recordShortTimeoutSignals = (): TimeoutRecorder => {
  const recorder: TimeoutRecorder = { delays: [] };
  const realTimeout = AbortSignal.timeout.bind(AbortSignal);

  vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    recorder.delays.push(milliseconds);

    return realTimeout(SHORT_DEADLINE_MS);
  });

  return recorder;
};

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

const settle = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const loadRoute = () => import("@root/app/api/place_order/route");

const buildOrderRequest = (): NextRequest =>
  new NextRequest(ROUTE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": CLIENT_IP,
    },
    body: JSON.stringify(ORDER_PAYLOAD),
  });

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("ORDER_RELAY_SECRET", RELAY_SECRET);
});

afterEach(async () => {
  await closeLocalRelays();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/place_order forwarding over a real relay socket", () => {
  it("puts the order on the wire as the exact bytes the checkout composed, under a json content type", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(ACCEPTED_STATUS, JSON_HEADERS, ACCEPTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(relay.received).toHaveLength(SINGLE_REQUEST);
    expect(relay.received[0]?.url).toBe(RELAY_PATH);
    expect(relay.received[0]?.body).toBe(JSON.stringify(ORDER_PAYLOAD));
    expect(relay.received[0]?.contentType).toBe(JSON_CONTENT_TYPE);
    expect(relay.received[0]?.secret).toBe(RELAY_SECRET);
  });

  it("answers an accepted order with our own json body, never the bytes the relay chose", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(ACCEPTED_STATUS, JSON_HEADERS, ACCEPTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(body).toBe(SUBSTITUTE_BODY);
    expect(body).not.toContain("orderId");
  });

  it("mirrors a relay rejection over a real socket and still answers our own sealed json", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(REJECTED_STATUS, PLAIN_HEADERS, REJECTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(REJECTED_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(body).toBe(SUBSTITUTE_BODY);
    expect(body).not.toContain(REJECTED_BODY);
  });

  it("stops a relay that keeps sending instead of draining a body nobody reads", async () => {
    const relay = await trackLocalRelay(() =>
      pumpWith(ACCEPTED_STATUS, JSON_HEADERS, PUMP_CHUNK, PUMP_TOTAL_BYTES)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    await settle(PUMP_SETTLE_MS);

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(await response.text()).toBe(SUBSTITUTE_BODY);
    expect(relay.isClosed()).toBe(true);
    expect(relay.bytesWritten()).toBeLessThan(PUMP_TOTAL_BYTES);
  });

  it("answers as soon as the relay's headers land, without waiting for a body it will never read", async () => {
    const relay = await trackLocalRelay(() =>
      dripWith(ACCEPTED_STATUS, JSON_HEADERS, DRIPPED_HEAD)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(await response.text()).toBe(SUBSTITUTE_BODY);
  });

  it("lets none of the relay's own response headers reach the buyer", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(ACCEPTED_STATUS, RELAY_OWN_HEADERS, ACCEPTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(ACCEPTED_STATUS);

    for (const header of RELAY_OWN_HEADER_NAMES) {
      expect(response.headers.get(header)).toBeNull();
    }

    expect([...response.headers.keys()].sort()).toEqual([
      "content-type",
      "x-content-type-options",
    ]);
  });

  it("answers a relay 205 with no body at all, because a reset status can carry none", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(RESET_CONTENT_STATUS, JSON_HEADERS, "")
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(RESET_CONTENT_STATUS);
    expect(response.body).toBeNull();
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
  });

  it("refuses a relay status no response of ours could carry, instead of throwing on it", async () => {
    silenceErrorLog();

    const relay = await trackLocalRelay(() =>
      replyWith(UNCARRIABLE_STATUS, JSON_HEADERS, ACCEPTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(FAILED_STATUS);
    expect(await response.text()).toBe(FAILED_BODY);
  });

  it("answers 504 when a relay accepts the connection and then never says anything", async () => {
    silenceErrorLog();

    const recorder = recordShortTimeoutSignals();
    const relay = await trackLocalRelay(() => SILENCE);

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(GATEWAY_TIMEOUT_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(recorder.delays).toEqual([RELAY_REQUEST_TIMEOUT_MS]);
    expect(relay.received).toHaveLength(SINGLE_REQUEST);
  });
});
