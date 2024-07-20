import { NextResponse } from "next/server";
import { db } from "@root/lib/firebaseAdmin";

export async function GET(
  _: any,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

  try {
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error fetching category and products:", error);

    return NextResponse.json(
      { error: "Failed to fetch category and products", details: errorMessage },
      { status: 500 }
    );
  }
}
