import type { Metadata } from "next";

import { resolveLocale } from "@root/utils/locale";

import NotFoundScreen from "@root/components/pages/NotFoundScreen";

import { getDictionary } from "../dictionaries";

interface INotFoundPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: INotFoundPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = getDictionary(resolveLocale(lang));

  return {
    title: dictionary.not_found.title,
    robots: { index: false },
  };
}

export default async function NotFoundPage({ params }: INotFoundPageProps) {
  await params;

  return <NotFoundScreen />;
}
