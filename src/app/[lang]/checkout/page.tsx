import type { Metadata } from "next";

import { resolveLocale } from "@root/utils/locale";
import { capitalize } from "@root/utils/seo";

import CheckoutScreen from "@root/components/pages/CheckoutScreen";

import { getDictionary } from "../dictionaries";

interface ICheckoutPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ICheckoutPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = getDictionary(resolveLocale(lang));

  return {
    title: capitalize(dictionary.checkout.checkout),
    robots: { index: false },
    openGraph: null,
  };
}

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
