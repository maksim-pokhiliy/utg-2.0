import { NextResponse } from "next/server";
import { FirebaseConfigError, getDb } from "@root/lib/firebaseAdmin";

export async function GET(
  _: any,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

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

    const categoryData = categoryDoc.data();

    const productsSnapshot = await db
      .collection("categories")
      .doc(categoryId.toUpperCase())
      .collection("products")
      .get();

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const category = {
      id: categoryDoc.id,
      ...categoryData,
      products: products,
    };

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      return NextResponse.json(
        { error: "Catalog service is not configured" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error fetching category and products:", error);

    return NextResponse.json(
      { error: "Failed to fetch category and products", details: errorMessage },
      { status: 500 }
    );
  }
}
