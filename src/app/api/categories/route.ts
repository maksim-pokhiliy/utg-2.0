import { NextResponse } from "next/server";

import { db } from "@root/lib/firebaseAdmin";

export async function GET() {
  try {
    const categoriesSnapshot = await db.collection("categories").get();

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error fetching categories:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories", details: errorMessage },
      { status: 500 }
    );
  }
}
