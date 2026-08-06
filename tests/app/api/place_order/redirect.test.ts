import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createServer } from "node:http";

import { NextRequest } from "next/server";

const ROUTE_URL = "https://example.test/api/place_order";
const CLIENT_IP = "203.0.113.9";
const RELAY_SECRET = "s3cret-relay-token";
const SECRET_HEADER = "x-relay-secret";
const REDIRECT_STATUS = 307;
const ACCEPTED_BODY = '{"status":"success"}';
const FAILED_BODY = '{"error":"Failed to place order"}';

const ORDER_PAYLOAD = {
  first_name: "John",
  total: "1200.00",
  cart: [{ title: "«Waiting»", quantity: 1 }],
};

type ReceivedRequest = {
  url: string;
  secret: string | string[] | undefined;
  headerNames: string[];
};

type Reply = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

type LocalServer = {
  origin: string;
  received: ReceivedRequest[];
  close: () => Promise<void>;
};

const startServer = async (reply: () => Reply): Promise<LocalServer> => {
  const received: ReceivedRequest[] = [];
  const server = createServer((request, response) => {
    request.resume();
    received.push({
      url: request.url ?? "",
      secret: request.headers[SECRET_HEADER],
      headerNames: Object.keys(request.headers),
    });

    const answer = reply();

    response.writeHead(answer.status, answer.headers);
    response.end(answer.body);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("the local relay stand-in did not bind to a port");
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    received,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
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

const running: LocalServer[] = [];

const track = async (reply: () => Reply): Promise<LocalServer> => {
  const server = await startServer(reply);

  running.push(server);

  return server;
};

const acceptOrder = (): Reply => ({
  status: 200,
  headers: { "Content-Type": "application/json" },
  body: ACCEPTED_BODY,
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("ORDER_RELAY_SECRET", RELAY_SECRET);
});

afterEach(async () => {
  await Promise.all(running.splice(0).map((server) => server.close()));
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/place_order against a real relay socket", () => {
  it("delivers the order and the secret to a relay that answers directly", async () => {
    const relay = await track(acceptOrder);

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(ACCEPTED_BODY);
    expect(relay.received).toHaveLength(1);
    expect(relay.received[0]?.url).toBe("/place_order");
    expect(relay.received[0]?.secret).toBe(RELAY_SECRET);
  });

  it("puts no secret header on the wire at all when the variable is unset", async () => {
    vi.stubEnv("ORDER_RELAY_SECRET", undefined);

    const relay = await track(acceptOrder);

    vi.stubEnv("PLACE_ORDER_URL", relay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(200);
    expect(relay.received).toHaveLength(1);
    expect(relay.received[0]?.secret).toBeUndefined();
    expect(relay.received[0]?.headerNames).not.toContain(SECRET_HEADER);
  });

  it("never lets a redirecting relay hand the order or the secret to a second hop", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const secondHop = await track(acceptOrder);
    const redirectingRelay = await track(() => ({
      status: REDIRECT_STATUS,
      headers: { Location: `${secondHop.origin}/place_order` },
      body: "",
    }));

    vi.stubEnv("PLACE_ORDER_URL", redirectingRelay.origin);

    const { POST } = await loadRoute();
    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(500);
    expect(await response.text()).toBe(FAILED_BODY);
    expect(redirectingRelay.received).toHaveLength(1);
    expect(secondHop.received).toHaveLength(0);
  });
});
