import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

export const metadata: Metadata = {
  title: "UTG | Merch",
  description: "Donate and fight with us",
};

export default async function Categories({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const categories = getCategorySummaries(resolveLocale(lang));

  return <CategoriesScreen categories={categories} />;
}
