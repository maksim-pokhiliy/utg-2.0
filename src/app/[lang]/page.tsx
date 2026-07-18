import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import HomeScreen from "@root/components/pages/HomeScreen";

export const metadata: Metadata = {
  title: "UTG | Main",
  description: "Donate and fight with us",
};

export default function Home({ params }: { params: { lang: string } }) {
  const categories = getCategorySummaries(resolveLocale(params.lang));

  return <HomeScreen categories={categories} />;
}
