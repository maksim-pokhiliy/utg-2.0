"use client";

import { useEffect, useState } from "react";

import { IApiResponse, ICategory } from "@root/types";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

export default function Categories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: IApiResponse<{ categories: ICategory[] }> = await fetch(
          "/api/categories"
        ).then((data) => data.json());

        setCategories(response.categories ?? []);
      } catch (error) {
        console.error("fetchCategories error: ", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchCategories();
  }, []);

  return <CategoriesScreen isLoading={isLoading} categories={categories} />;
}
