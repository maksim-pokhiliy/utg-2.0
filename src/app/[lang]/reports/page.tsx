import type { Metadata } from "next";

import { resolveLocale } from "@root/utils/locale";
import { buildPageMetadata, capitalize, siteOgImage } from "@root/utils/seo";

import ReportsScreen from "@root/components/pages/ReportsScreen";

import { getDictionary } from "../dictionaries";

interface IReportsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: IReportsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "/reports",
    title: capitalize(dictionary.shared.reports),
    description: dictionary.reports.intro,
    image: siteOgImage(),
  });
}

export default function Reports() {
  return <ReportsScreen />;
}
