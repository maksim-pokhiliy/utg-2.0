import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

import { expectUpstreamOnly, stubUpstream } from "../../../support/apiTest";

const ROUTE_URL = "https://example.test/api/place_order";
const FAKE_RELAY_ORIGIN = "https://relay.invalid";
const RELAY_HOST = "relay.invalid";
const UPSTREAM_URL = `${FAKE_RELAY_ORIGIN}/place_order`;

const CLIENT_IP = "203.0.113.5";
const BODY_TRAP_MESSAGE = "request.json() ran before the guards";

const RATE_LIMIT_MAX_REQUESTS = 5;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

const NOT_CONFIGURED_BODY = '{"error":"Order service is not configured"}';
const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const FAILED_BODY = '{"error":"Failed to place order"}';

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

const AUTHENTICATED_HEADERS = {
  "Content-Type": "application/json",
  "x-relay-secret": RELAY_SECRET,
};

const ORDER_PAYLOAD = {
  first_name: "John",
  total: "1200.00",
  cart: [{ title: "«Waiting»", quantity: 2 }],
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

const trapRequestBody = (request: NextRequest) =>
  vi.spyOn(request, "json").mockImplementation(() => {
    throw new Error(BODY_TRAP_MESSAGE);
  });

const stubAcceptedUpstream = () =>
  stubUpstream(() =>
    Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
  );

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
  it("answers 503 without reading the body when the relay is not configured", async () => {
    vi.stubEnv("PLACE_ORDER_URL", undefined);

    const fetchStub = stubUpstream(() => Promise.resolve(new Response(null)));
    const { POST } = await loadRoute();
    const request = buildOrderRequest();
    const bodyTrap = trapRequestBody(request);

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(await response.text()).toBe(NOT_CONFIGURED_BODY);
    expect(bodyTrap).not.toHaveBeenCalled();
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers 429 with a Retry-After header on the sixth request from one client", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const { POST } = await loadRoute();

    const allowedStatuses: number[] = [];

    for (let attempt = 0; attempt < RATE_LIMIT_MAX_REQUESTS; attempt += 1) {
      const allowed = await POST(buildOrderRequest());

      allowedStatuses.push(allowed.status);
    }

    const blockedRequest = buildOrderRequest();
    const bodyTrap = trapRequestBody(blockedRequest);
    const blocked = await POST(blockedRequest);

    expect(allowedStatuses).toEqual(Array(RATE_LIMIT_MAX_REQUESTS).fill(200));
    expect(blocked.status).toBe(429);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);
    expect(bodyTrap).not.toHaveBeenCalled();

    const retryAfter = Number(blocked.headers.get("Retry-After"));

    expect(retryAfter).toBeGreaterThanOrEqual(MIN_RETRY_AFTER_SECONDS);
    expect(retryAfter).toBeLessThanOrEqual(MAX_RETRY_AFTER_SECONDS);

    expect(fetchStub).toHaveBeenCalledTimes(RATE_LIMIT_MAX_REQUESTS);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("posts the order payload to the configured relay unchanged", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const { POST } = await loadRoute();

    await POST(buildOrderRequest());

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ORDER_PAYLOAD),
    });
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
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
    });

    const [, init] = fetchStub.mock.calls[0];

    expect(() => new Headers(init?.headers)).not.toThrow();
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it.each(UNSENDABLE_RELAY_SECRETS)(
    "answers 503 without reading the body, calling the relay or logging the value when the relay secret cannot ride a header: %j",
    async (secret) => {
      vi.stubEnv(RELAY_SECRET_NAME, secret);

      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();
      const request = buildOrderRequest();
      const bodyTrap = trapRequestBody(request);

      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(await response.text()).toBe(NOT_CONFIGURED_BODY);
      expect(bodyTrap).not.toHaveBeenCalled();
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
    });
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it.each(BLANK_RELAY_SECRETS)(
    "sends no x-relay-secret header when the relay secret is %j",
    async (secret) => {
      vi.stubEnv(RELAY_SECRET_NAME, secret);

      const fetchStub = stubAcceptedUpstream();
      const { POST } = await loadRoute();

      await POST(buildOrderRequest());

      expect(fetchStub).toHaveBeenCalledWith(UPSTREAM_URL, {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ORDER_PAYLOAD),
      });
      expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
    }
  );

  it("forwards the upstream status, content type and body verbatim", async () => {
    const upstreamBody = '{"orderId":"77"}';
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        new Response(upstreamBody, {
          status: 202,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        })
      )
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(202);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8"
    );
    expect(await response.text()).toBe(upstreamBody);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("forwards an upstream rejection status and its non-json content type", async () => {
    const upstreamBody = "order rejected";
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        new Response(upstreamBody, {
          status: 422,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      )
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(422);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(await response.text()).toBe(upstreamBody);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("answers with a null body when the upstream answers 204", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(new Response(null, { status: 204 }))
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });

  it("answers 500 without leaking the relay when the upstream throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const fetchStub = stubUpstream(() =>
      Promise.reject(new Error(`connect ECONNREFUSED ${RELAY_HOST}`))
    );
    const { POST } = await loadRoute();

    const response = await POST(buildOrderRequest());
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe(FAILED_BODY);
    expect(body).not.toContain("details");
    expect(body).not.toContain(RELAY_HOST);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, UPSTREAM_URL);
  });
});
