import type { Metadata } from "next";

import { getCategorySummaries, resolveLocale } from "@root/data";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

export const metadata: Metadata = {
  title: "UTG | Merch",
  description: "Donate and fight with us",
};

export default function Categories({ params }: { params: { lang: string } }) {
  const categories = getCategorySummaries(resolveLocale(params.lang));

  return <CategoriesScreen categories={categories} />;
}
