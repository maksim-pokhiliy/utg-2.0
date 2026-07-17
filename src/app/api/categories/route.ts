import { NextResponse } from "next/server";

import { FirebaseConfigError, getDb } from "@root/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = getDb();

    const categoriesSnapshot = await db.collection("categories").get();

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      return NextResponse.json(
        { error: "Catalog service is not configured" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error fetching categories:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories", details: errorMessage },
      { status: 500 }
    );
  }
}
