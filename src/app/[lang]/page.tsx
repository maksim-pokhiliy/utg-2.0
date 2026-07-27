import type { Metadata } from "next";

import { getCategorySummaries } from "@root/data";
import { resolveLocale } from "@root/utils/locale";
import { buildPageMetadata, siteOgImage } from "@root/utils/seo";

import HomeScreen from "@root/components/pages/HomeScreen";

import { getDictionary } from "./dictionaries";

interface IHomePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: IHomePageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "",
    description: dictionary.footer.mission,
    image: siteOgImage(),
  });
}

export default async function Home({ params }: IHomePageProps) {
  const { lang } = await params;
  const categories = getCategorySummaries(resolveLocale(lang));

  return <HomeScreen categories={categories} />;
}
