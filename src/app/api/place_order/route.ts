import { NextRequest, NextResponse } from "next/server";

import {
  buildRateLimitedResponse,
  consumeRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";

const SENDABLE_SECRET_PATTERN = /^[\x20-\x7e]+$/;

const buildNotConfiguredResponse = () =>
  NextResponse.json(
    { error: "Order service is not configured" },
    { status: 503 }
  );

export async function POST(request: NextRequest) {
  const verdict = consumeRateLimit(resolveClientKey(request));

  if (!verdict.isAllowed) {
    return buildRateLimitedResponse(verdict);
  }

  const placeOrderUrl = process.env.PLACE_ORDER_URL;

  if (!placeOrderUrl) {
    return buildNotConfiguredResponse();
  }

  const relaySecret = process.env.ORDER_RELAY_SECRET?.trim();

  if (relaySecret && !SENDABLE_SECRET_PATTERN.test(relaySecret)) {
    console.error("Order relay secret is not a usable header value");

    return buildNotConfiguredResponse();
  }

  try {
    const body = await request.json();

    const response = await fetch(`${placeOrderUrl}/place_order`, {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        ...(relaySecret ? { "x-relay-secret": relaySecret } : {}),
      },
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();

    const isNullBodyStatus =
      response.status === 204 ||
      response.status === 205 ||
      response.status === 304;

    return new NextResponse(isNullBodyStatus ? null : responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Error placing order:", error);

    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
