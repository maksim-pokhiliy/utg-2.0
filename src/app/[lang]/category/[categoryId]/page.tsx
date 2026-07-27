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
import { buildPageMetadata, capitalize, siteOgImage } from "@root/utils/seo";

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
    return { title: capitalize(dictionary.shared.merch) };
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
    image: siteOgImage(),
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
