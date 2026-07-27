import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";
import { formatCategoryCount } from "@root/utils/plural";
import { buildPageMetadata, capitalize, siteOgImage } from "@root/utils/seo";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

import { getDictionary } from "../dictionaries";

interface ICategoriesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ICategoriesPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);
  const categoryCount = formatCategoryCount(
    getCategorySummaries(locale).length,
    locale,
    dictionary
  );

  return buildPageMetadata({
    locale,
    path: "/category",
    title: capitalize(dictionary.shared.merch),
    description: `${categoryCount}. ${dictionary.footer.mission}`,
    image: siteOgImage(),
  });
}

export default async function Categories({ params }: ICategoriesPageProps) {
  const { lang } = await params;
  const categories = getCategorySummaries(resolveLocale(lang));

  return <CategoriesScreen categories={categories} />;
}
