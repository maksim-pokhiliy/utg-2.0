import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const placeOrderUrl = process.env.PLACE_ORDER_URL;

  if (!placeOrderUrl) {
    return NextResponse.json(
      { error: "Order service is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${placeOrderUrl}/place_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error placing order:", error);

    return NextResponse.json(
      { error: "Failed to place order", details: errorMessage },
      { status: 500 }
    );
  }
}
