import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

import {
  SILENCE,
  closeLocalRelays,
  dripWith,
  replyWith,
  trackLocalRelay,
} from "../../../support/localRelay";

const ROUTE_URL = "https://example.test/api/place_order";
const CLIENT_IP = "203.0.113.11";
const RELAY_SECRET = "s3cret-relay-token";

const RELAY_REQUEST_TIMEOUT_MS = 20_000;
const SHORT_DEADLINE_MS = 40;
const MAX_RELAY_BODY_BYTES = 65_536;

const JSON_CONTENT_TYPE = "application/json";
const PLAIN_CONTENT_TYPE = "text/plain; charset=utf-8";
const NOSNIFF_HEADER = "X-Content-Type-Options";
const NOSNIFF_VALUE = "nosniff";
const CONTENT_TYPE_HEADER = "Content-Type";

const JSON_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };
const PLAIN_HEADERS = { [CONTENT_TYPE_HEADER]: PLAIN_CONTENT_TYPE };
const UNLABELLED_HEADERS: Record<string, string> = {};

const ACCEPTED_STATUS = 200;
const REJECTED_STATUS = 422;
const GATEWAY_TIMEOUT_STATUS = 504;

const ACCEPTED_BODY = '{"status":"success"}';
const REJECTED_BODY = "order rejected";
const SUBSTITUTE_BODY = "{}";
const FAILED_BODY = '{"error":"Failed to place order"}';
const DRIPPED_HEAD = '{"status":';

const RELAY_PATH = "/place_order";
const SINGLE_REQUEST = 1;

const ORDER_PAYLOAD = {
  first_name: "John",
  last_name: "Smith",
  total: "1200.00",
  cart: [{ title: "«Waiting» · L", quantity: 2 }],
};

const OVERSIZED_BODY = JSON.stringify({
  padding: "x".repeat(MAX_RELAY_BODY_BYTES),
});

interface TimeoutRecorder {
  delays: number[];
  signals: AbortSignal[];
}

const recordShortTimeoutSignals = (): TimeoutRecorder => {
  const recorder: TimeoutRecorder = { delays: [], signals: [] };
  const realTimeout = AbortSignal.timeout.bind(AbortSignal);

  vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    const signal = realTimeout(SHORT_DEADLINE_MS);

    recorder.delays.push(milliseconds);
    recorder.signals.push(signal);

    return signal;
  });

  return recorder;
};

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

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
    expect(await response.text()).toBe(ACCEPTED_BODY);
    expect(relay.received).toHaveLength(SINGLE_REQUEST);
    expect(relay.received[0]?.url).toBe(RELAY_PATH);
    expect(relay.received[0]?.body).toBe(JSON.stringify(ORDER_PAYLOAD));
    expect(relay.received[0]?.contentType).toBe(JSON_CONTENT_TYPE);
    expect(relay.received[0]?.secret).toBe(RELAY_SECRET);
  });

  it("mirrors a relay rejection over a real socket and answers it sealed as our own json", async () => {
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

  it("replaces a relay answer that declares no media type at all, because an unlabelled body is not json", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(ACCEPTED_STATUS, UNLABELLED_HEADERS, ACCEPTED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(body).toBe(SUBSTITUTE_BODY);
    expect(body).not.toContain(ACCEPTED_BODY);
  });

  it("stops reading a relay body past the cap and still mirrors the relay's verdict", async () => {
    const relay = await trackLocalRelay(() =>
      replyWith(ACCEPTED_STATUS, JSON_HEADERS, OVERSIZED_BODY)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(OVERSIZED_BODY.length).toBeGreaterThan(MAX_RELAY_BODY_BYTES);
    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(response.headers.get(CONTENT_TYPE_HEADER)).toBe(JSON_CONTENT_TYPE);
    expect(response.headers.get(NOSNIFF_HEADER)).toBe(NOSNIFF_VALUE);
    expect(await response.text()).toBe(SUBSTITUTE_BODY);
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

  it("stops reading a relay that answers its headers and then drips its body past the deadline", async () => {
    silenceErrorLog();

    const recorder = recordShortTimeoutSignals();
    const relay = await trackLocalRelay(() =>
      dripWith(ACCEPTED_STATUS, JSON_HEADERS, DRIPPED_HEAD)
    );

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(GATEWAY_TIMEOUT_STATUS);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(recorder.delays).toEqual([RELAY_REQUEST_TIMEOUT_MS]);
  });
});
