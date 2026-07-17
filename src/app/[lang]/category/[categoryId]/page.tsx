import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategorySlugs, getCategoryView } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import CategoryScreen from "@root/components/pages/CategoryScreen";

interface ICategoryPageProps {
  params: { lang: string; categoryId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategorySlugs().map((categoryId) => ({ categoryId }));
}

export function generateMetadata({ params }: ICategoryPageProps): Metadata {
  const category = getCategoryView(
    params.categoryId,
    resolveLocale(params.lang)
  );

  if (!category) {
    return { title: "UTG | Merch" };
  }

  return {
    title: `${category.name} | UTG`,
    description: "Donate and fight with us",
  };
}

export default function Category({ params }: ICategoryPageProps) {
  const category = getCategoryView(
    params.categoryId,
    resolveLocale(params.lang)
  );

  if (!category) {
    notFound();
  }

  return <CategoryScreen category={category} />;
}
