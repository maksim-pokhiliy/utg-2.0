import type { Metadata } from "next";

import { getCategoryViews, resolveLocale } from "@root/data";

import HomeScreen from "@root/components/pages/HomeScreen";

export const metadata: Metadata = {
  title: "UTG | Main",
  description: "Donate and fight with us",
};

export default function Home({ params }: { params: { lang: string } }) {
  const categories = getCategoryViews(resolveLocale(params.lang));

  return <HomeScreen categories={categories} />;
}
