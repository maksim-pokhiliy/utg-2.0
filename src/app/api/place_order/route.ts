import { NextRequest, NextResponse } from "next/server";

import {
  buildRateLimitedResponse,
  consumeRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";

import { forwardOrder } from "./relay";

const SENDABLE_SECRET_PATTERN = /^[\x20-\x7e]+$/;
const TRAILING_SLASHES = /\/+$/;

const NOT_CONFIGURED_BODY = { error: "Order service is not configured" };
const FAILED_BODY = { error: "Failed to place order" };

const NOT_CONFIGURED_STATUS = 503;
const FAILED_STATUS = 500;
const GATEWAY_TIMEOUT_STATUS = 504;

const SEALED_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

export const maxDuration = 25;

const buildSealedJson = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: SEALED_HEADERS });

const buildNotConfiguredResponse = () =>
  buildSealedJson(NOT_CONFIGURED_BODY, NOT_CONFIGURED_STATUS);

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

  const configuredSecret = process.env.ORDER_RELAY_SECRET;
  const relaySecret = configuredSecret?.trim();

  if (relaySecret && !SENDABLE_SECRET_PATTERN.test(relaySecret)) {
    console.error("Order relay secret is not a usable header value");

    return buildNotConfiguredResponse();
  }

  if (configuredSecret !== undefined && !relaySecret) {
    console.error("Order relay secret is blank; sending the order unsigned");
  }

  try {
    const outcome = await forwardOrder({
      relayOrigin: placeOrderUrl.replace(TRAILING_SLASHES, ""),
      relaySecret,
      payload: await request.json(),
    });

    if (outcome.kind === "timed_out") {
      return buildSealedJson(FAILED_BODY, GATEWAY_TIMEOUT_STATUS);
    }

    if (outcome.kind === "failed") {
      return buildSealedJson(FAILED_BODY, FAILED_STATUS);
    }

    return new NextResponse(outcome.body, {
      status: outcome.status,
      headers: SEALED_HEADERS,
    });
  } catch (error) {
    console.error("The checkout sent a body the route could not read:", error);

    return buildSealedJson(FAILED_BODY, FAILED_STATUS);
  }
}
