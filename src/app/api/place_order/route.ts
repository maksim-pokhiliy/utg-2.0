import { NextRequest, NextResponse } from "next/server";

import {
  buildRateLimitedResponse,
  consumeRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";

import { forwardOrder, type RelayOutcome } from "./relay";

const SENDABLE_SECRET_PATTERN = /^[\x20-\x7e]+$/;
const TRAILING_SLASHES = /\/+$/;
const RELAY_PATH_SEGMENT = "place_order";
const PATH_SEPARATOR = "/";

const MAX_ORDER_BODY_BYTES = 65_536;

const NOT_CONFIGURED_BODY = { error: "Order service is not configured" };
const FAILED_BODY = { error: "Failed to place order" };

const NOT_CONFIGURED_STATUS = 503;
const FAILED_STATUS = 500;
const PAYLOAD_TOO_LARGE_STATUS = 413;
const GATEWAY_TIMEOUT_STATUS = 504;

const SUBSTITUTE_BODY = "{}";

const TOO_LARGE_LOG = "The checkout sent a body past the accepted size";
const UNREADABLE_LOG = "The checkout sent a body the route could not read";

const SEALED_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

export const maxDuration = 25;

type RelaySecret =
  | { kind: "usable"; secret: string | undefined }
  | { kind: "unusable" };

type OrderPayload =
  | { kind: "parsed"; value: unknown }
  | { kind: "too_large" }
  | { kind: "unreadable" };

const UNUSABLE_SECRET = Object.freeze<RelaySecret>({ kind: "unusable" });

const TOO_LARGE = Object.freeze<OrderPayload>({ kind: "too_large" });
const UNREADABLE = Object.freeze<OrderPayload>({ kind: "unreadable" });

const buildSealedJson = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: SEALED_HEADERS });

const buildNotConfiguredResponse = () =>
  buildSealedJson(NOT_CONFIGURED_BODY, NOT_CONFIGURED_STATUS);

const refusePayload = (message: string, status: number): NextResponse => {
  console.error(message);

  return buildSealedJson(FAILED_BODY, status);
};

const buildRelayTarget = (placeOrderUrl: string): string | null => {
  try {
    const base = new URL(placeOrderUrl);

    base.pathname = `${base.pathname.replace(TRAILING_SLASHES, "")}${PATH_SEPARATOR}`;

    return new URL(RELAY_PATH_SEGMENT, base).toString();
  } catch {
    return null;
  }
};

const resolveRelaySecret = (): RelaySecret => {
  const configuredSecret = process.env.ORDER_RELAY_SECRET;
  const relaySecret = configuredSecret?.trim();

  if (relaySecret && !SENDABLE_SECRET_PATTERN.test(relaySecret)) {
    console.error("Order relay secret is not a usable header value");

    return UNUSABLE_SECRET;
  }

  if (configuredSecret !== undefined && !relaySecret) {
    console.error("Order relay secret is blank; sending the order unsigned");
  }

  return { kind: "usable", secret: relaySecret };
};

const readOrderPayload = async (
  request: NextRequest
): Promise<OrderPayload> => {
  const stream = request.body;

  if (stream === null) {
    return UNREADABLE;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let text = "";
  let size = 0;

  for (;;) {
    const chunk = await reader.read();

    if (chunk.done) {
      break;
    }

    size += chunk.value.byteLength;

    if (size > MAX_ORDER_BODY_BYTES) {
      await reader.cancel();

      return TOO_LARGE;
    }

    text += decoder.decode(chunk.value, { stream: true });
  }

  try {
    return { kind: "parsed", value: JSON.parse(text + decoder.decode()) };
  } catch {
    return UNREADABLE;
  }
};

const buildRelayResponse = (outcome: RelayOutcome): NextResponse => {
  if (outcome.kind === "timed_out") {
    return buildSealedJson(FAILED_BODY, GATEWAY_TIMEOUT_STATUS);
  }

  if (outcome.kind === "failed") {
    return buildSealedJson(FAILED_BODY, FAILED_STATUS);
  }

  if (outcome.kind === "empty") {
    return new NextResponse(null, {
      status: outcome.status,
      headers: SEALED_HEADERS,
    });
  }

  return new NextResponse(SUBSTITUTE_BODY, {
    status: outcome.status,
    headers: SEALED_HEADERS,
  });
};

export async function POST(request: NextRequest) {
  const verdict = consumeRateLimit(resolveClientKey(request));

  if (!verdict.isAllowed) {
    return buildRateLimitedResponse(verdict);
  }

  const placeOrderUrl = process.env.PLACE_ORDER_URL;

  if (!placeOrderUrl) {
    console.error("Order relay URL is not configured");

    return buildNotConfiguredResponse();
  }

  const relayTarget = buildRelayTarget(placeOrderUrl);

  if (relayTarget === null) {
    console.error("Order relay URL is not a usable address");

    return buildNotConfiguredResponse();
  }

  const relaySecret = resolveRelaySecret();

  if (relaySecret.kind === "unusable") {
    return buildNotConfiguredResponse();
  }

  const payload = await readOrderPayload(request);

  if (payload.kind === "too_large") {
    return refusePayload(TOO_LARGE_LOG, PAYLOAD_TOO_LARGE_STATUS);
  }

  if (payload.kind === "unreadable") {
    return refusePayload(UNREADABLE_LOG, FAILED_STATUS);
  }

  return buildRelayResponse(
    await forwardOrder({
      relayTarget,
      relaySecret: relaySecret.secret,
      payload: payload.value,
    })
  );
}
