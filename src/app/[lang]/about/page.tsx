import type { Metadata } from "next";

import { resolveLocale } from "@root/utils/locale";
import { buildPageMetadata, capitalize, siteOgImage } from "@root/utils/seo";

import AboutScreen from "@root/components/pages/AboutScreen";

import { getDictionary } from "../dictionaries";

interface IAboutPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: IAboutPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "/about",
    title: capitalize(dictionary.shared.about),
    description: dictionary.about.site_created,
    image: siteOgImage(),
  });
}

export default function About() {
  return <AboutScreen />;
}
