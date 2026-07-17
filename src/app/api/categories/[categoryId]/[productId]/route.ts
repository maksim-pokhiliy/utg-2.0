import { NextResponse } from "next/server";

import { FirebaseConfigError, getDb } from "@root/lib/firebaseAdmin";

export async function GET(
  _: any,
  { params }: { params: { categoryId: string; productId: string } }
) {
  const { categoryId, productId } = params;

  try {
    const db = getDb();

    const categoryDoc = await db
      .collection("categories")
      .doc(categoryId.toUpperCase())
      .get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const productDoc = await db
      .collection("categories")
      .doc(categoryId.toUpperCase())
      .collection("products")
      .doc(productId)
      .get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data(),
    };

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      return NextResponse.json(
        { error: "Catalog service is not configured" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error fetching product:", error);

    return NextResponse.json(
      { error: "Failed to fetch product", details: errorMessage },
      { status: 500 }
    );
  }
}
