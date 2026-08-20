import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

import {
  closeLocalRelays,
  replyWith,
  trackLocalRelay,
  type RelayAnswer,
} from "../../../support/localRelay";

const ROUTE_URL = "https://example.test/api/place_order";
const CLIENT_IP = "203.0.113.9";
const RELAY_SECRET = "s3cret-relay-token";
const SECRET_HEADER = "x-relay-secret";
const JSON_HEADERS = { "Content-Type": "application/json" };
const REDIRECT_STATUS = 307;
const ACCEPTED_STATUS = 200;
const FAILED_STATUS = 500;
const ACCEPTED_BODY = '{"status":"success"}';
const FAILED_BODY = '{"error":"Failed to place order"}';
const EMPTY_BODY = "";
const SINGLE_REQUEST = 1;
const NO_REQUESTS = 0;

const ORDER_PAYLOAD = {
  first_name: "John",
  total: "1200.00",
  cart: [{ title: "«Waiting»", quantity: 1 }],
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

const acceptOrder = (): RelayAnswer =>
  replyWith(ACCEPTED_STATUS, JSON_HEADERS, ACCEPTED_BODY);

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("ORDER_RELAY_SECRET", RELAY_SECRET);
});

afterEach(async () => {
  await closeLocalRelays();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/place_order against a real relay socket", () => {
  it("delivers the order and the secret to a relay that answers directly", async () => {
    const relay = await trackLocalRelay(acceptOrder);

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(await response.text()).toBe(ACCEPTED_BODY);
    expect(relay.received).toHaveLength(SINGLE_REQUEST);
    expect(relay.received[0]?.url).toBe("/place_order");
    expect(relay.received[0]?.secret).toBe(RELAY_SECRET);
  });

  it("puts no secret header on the wire at all when the variable is unset", async () => {
    vi.stubEnv("ORDER_RELAY_SECRET", undefined);

    const relay = await trackLocalRelay(acceptOrder);

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(ACCEPTED_STATUS);
    expect(relay.received).toHaveLength(SINGLE_REQUEST);
    expect(relay.received[0]?.secret).toBeUndefined();
    expect(relay.received[0]?.headerNames).not.toContain(SECRET_HEADER);
  });

  it("never lets a redirecting relay hand the order or the secret to a second hop", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const secondHop = await trackLocalRelay(acceptOrder);
    const redirectingRelay = await trackLocalRelay(() =>
      replyWith(
        REDIRECT_STATUS,
        { Location: `${secondHop.origin}/place_order` },
        EMPTY_BODY
      )
    );

    vi.stubEnv("PLACE_ORDER_URL", redirectingRelay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(FAILED_STATUS);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(redirectingRelay.received).toHaveLength(SINGLE_REQUEST);
    expect(secondHop.received).toHaveLength(NO_REQUESTS);
  });
});
