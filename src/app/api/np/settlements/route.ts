import { NextRequest, NextResponse } from "next/server";

import {
  consumeDirectoryRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";

import { searchSettlements } from "./directory";

const TOO_MANY_REQUESTS_BODY = { error: "Too many requests" };

const UNAVAILABLE_BODY = { error: "Directory service is unavailable" };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const verdict = consumeDirectoryRateLimit(resolveClientKey(request));

  if (!verdict.isAllowed) {
    return NextResponse.json(TOO_MANY_REQUESTS_BODY, {
      status: 429,
      headers: { "Retry-After": String(verdict.retryAfterSeconds) },
    });
  }

  try {
    const items = await searchSettlements(
      request.nextUrl.searchParams.get("q")
    );

    if (items === null) {
      return NextResponse.json(UNAVAILABLE_BODY, { status: 503 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to search the delivery directory:", error);

    return NextResponse.json(UNAVAILABLE_BODY, { status: 503 });
  }
}
