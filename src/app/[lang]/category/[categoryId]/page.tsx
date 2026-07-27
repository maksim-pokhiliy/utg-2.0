import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCategoryName,
  getCategorySlugs,
  getCategoryView,
  getProductSlugs,
} from "@root/data";
import { resolveLocale } from "@root/utils/locale";
import { formatItemCount } from "@root/utils/plural";
import { buildPageMetadata, SITE_OG_IMAGE } from "@root/utils/seo";

import CategoryScreen from "@root/components/pages/CategoryScreen";

import { getDictionary } from "../../dictionaries";

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
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);
  const categoryName = getCategoryName(categoryId, locale);

  if (categoryName === null) {
    notFound();
  }

  const itemCount = formatItemCount(
    getProductSlugs(categoryId).length,
    locale,
    dictionary
  );

  return buildPageMetadata({
    locale,
    path: `/category/${categoryId}`,
    title: categoryName,
    description: `${categoryName} — ${itemCount}. ${dictionary.footer.mission}`,
    image: SITE_OG_IMAGE,
  });
}

export default async function Category({ params }: ICategoryPageProps) {
  const { lang, categoryId } = await params;
  const category = getCategoryView(categoryId, resolveLocale(lang));

  if (!category) {
    notFound();
  }

  return <CategoryScreen category={category} />;
}
