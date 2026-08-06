import { NextRequest, NextResponse } from "next/server";

import {
  buildRateLimitedResponse,
  consumeDirectoryRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";

import { searchSettlements } from "./directory";

const UNAVAILABLE_BODY = { error: "Directory service is unavailable" };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const verdict = consumeDirectoryRateLimit(resolveClientKey(request));

  if (!verdict.isAllowed) {
    return buildRateLimitedResponse(verdict);
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
