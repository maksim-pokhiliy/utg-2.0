import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategorySlugs, getCategoryView } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import CategoryScreen from "@root/components/pages/CategoryScreen";

interface ICategoryPageProps {
  params: Promise<{ lang: string; categoryId: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategorySlugs().map((categoryId) => ({ categoryId }));
}

export async function generateMetadata({
  params,
}: ICategoryPageProps): Promise<Metadata> {
  const { lang, categoryId } = await params;
  const category = getCategoryView(categoryId, resolveLocale(lang));

  if (!category) {
    return { title: "UTG | Merch" };
  }

  return {
    title: `${category.name} | UTG`,
    description: "Donate and fight with us",
  };
}

export default async function Category({ params }: ICategoryPageProps) {
  const { lang, categoryId } = await params;
  const category = getCategoryView(categoryId, resolveLocale(lang));

  if (!category) {
    notFound();
  }

  return <CategoryScreen category={category} />;
}
