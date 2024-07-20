"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { IApiResponse, ICategory } from "@root/types";

import CategoryScreen from "@root/components/pages/CategoryScreen";

export default function Categories() {
  const params = useParams();

  const [category, setCategory] = useState<ICategory | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: IApiResponse<{ category: ICategory }> = await fetch(
          `/api/categories/${params.categoryId}`
        ).then((data) => data.json());

        setCategory(response.category ?? null);
      } catch (error) {
        console.error("fetchCategories error: ", error);
      }
    };

    fetchCategories();
  }, [params.categoryId]);

  return <CategoryScreen category={category} />;
}
