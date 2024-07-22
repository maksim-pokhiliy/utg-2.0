"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { IApiResponse, IProduct } from "@root/types";

import ProductScreen from "@root/components/pages/ProductScreen";

export default function Categories() {
  const params = useParams();

  const [product, setProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: IApiResponse<{ product: IProduct }> = await fetch(
          `/api/categories/${params.categoryId}/${params.productId}`
        ).then((data) => data.json());

        setProduct(response.product ?? null);
      } catch (error) {
        console.error("fetchCategories error: ", error);
      }
    };

    fetchCategories();
  }, [params.categoryId, params.productId]);

  return <ProductScreen product={product} />;
}
