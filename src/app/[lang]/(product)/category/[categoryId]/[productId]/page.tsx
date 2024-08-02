"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { IApiResponse, IProduct } from "@root/types";

import ProductScreen from "@root/components/pages/ProductScreen";

export default function Categories() {
  const params = useParams();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: IApiResponse<{ product: IProduct }> = await fetch(
          `/api/categories/${params.categoryId}/${params.productId}`
        ).then((data) => data.json());

        setProduct(response.product ?? null);
      } catch (error) {
        console.error("fetchCategories error: ", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchCategories();
  }, [params.categoryId, params.productId]);

  return <ProductScreen isLoading={isLoading} product={product} />;
}
