import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";

import HomeScreen from "@root/components/pages/HomeScreen";

export const metadata: Metadata = {
  title: "UTG | Main",
  description: "Donate and fight with us",
};

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const categories = getCategorySummaries(resolveLocale(lang));

  return <HomeScreen categories={categories} />;
}
