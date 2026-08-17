import { NextRequest, NextResponse } from "next/server";

import {
  buildRateLimitedResponse,
  consumeDirectoryRateLimit,
  resolveClientKey,
} from "@root/app/api/rate-limit";
import { stripInvisibles } from "@root/utils/invisibles";

import { isCityRef, isDeliveryMethod, listWarehouses } from "./directory";

const MAX_CITY_REF_LENGTH = 64;

const INVALID_REQUEST_BODY = { error: "Invalid request" };
const UNAVAILABLE_BODY = { error: "Directory service is unavailable" };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const verdict = consumeDirectoryRateLimit(resolveClientKey(request));

  if (!verdict.isAllowed) {
    return buildRateLimitedResponse(verdict);
  }

  const { searchParams } = request.nextUrl;
  const city = stripInvisibles(searchParams.get("city") ?? "").trim();
  const method = searchParams.get("method");

  if (
    city === "" ||
    city.length > MAX_CITY_REF_LENGTH ||
    !isCityRef(city) ||
    !isDeliveryMethod(method)
  ) {
    return NextResponse.json(INVALID_REQUEST_BODY, { status: 400 });
  }

  try {
    const items = await listWarehouses(city, method, searchParams.get("q"));

    if (items === null) {
      return NextResponse.json(UNAVAILABLE_BODY, { status: 503 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to list the delivery directory warehouses:", error);

    return NextResponse.json(UNAVAILABLE_BODY, { status: 503 });
  }
}
