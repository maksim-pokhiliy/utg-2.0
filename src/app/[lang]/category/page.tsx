import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import CategoriesScreen from "@root/components/pages/CategoriesScreen";

export const metadata: Metadata = {
  title: "UTG | Merch",
  description: "Donate and fight with us",
};

export default function Categories({ params }: { params: { lang: string } }) {
  const categories = getCategorySummaries(resolveLocale(params.lang));

  return <CategoriesScreen categories={categories} />;
}
