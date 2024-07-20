"use client";

import { useEffect, useState } from "react";

import { IApiResponse, ICategory } from "@root/types";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

export default function Categories() {
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: IApiResponse<{ categories: ICategory[] }> = await fetch(
          "/api/categories"
        ).then((data) => data.json());

        setCategories(response.categories ?? []);
      } catch (error) {
        console.error("fetchCategories error: ", error);
      }
    };

    fetchCategories();
  }, []);

  return <CategoriesScreen categories={categories} />;
}
