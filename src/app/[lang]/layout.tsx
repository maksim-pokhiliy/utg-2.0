import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

import { getDictionary } from "./dictionaries";

import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import CartDrawer from "@root/components/cart/CartDrawer";
import CartHydration from "@root/components/cart/CartHydration";
import { I18nProvider } from "@root/i18n";
import { Toaster } from "@root/design-system";

import "@root/app/globals.css";
import { resolveMoney } from "@root/utils/formatPrice";
import { resolveLocale } from "@root/utils/locale";

const display = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ lang: "uk" }, { lang: "en" }];
}

async function getConversionRates(): Promise<Record<string, number>> {
  const { EXCHANGE_RATE_API_URL, EXCHANGE_RATE_API_KEY } = process.env;

  if (!EXCHANGE_RATE_API_URL || !EXCHANGE_RATE_API_KEY) {
    return {};
  }

  try {
    const response = await fetch(
      `${EXCHANGE_RATE_API_URL}/${EXCHANGE_RATE_API_KEY}/latest/UAH`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();

    return data.conversion_rates ?? {};
  } catch (error) {
    console.error("Failed to fetch conversion rates:", error);

    return {};
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const conversionRates = await getConversionRates();
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dictionary = getDictionary(locale);
  const money = resolveMoney(locale, conversionRates);

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <I18nProvider locale={locale} dictionary={dictionary} money={money}>
          <Header />

          <main className="flex-1">{children}</main>

          <Footer year={new Date().getFullYear()} />

          <CartDrawer />
          <Toaster />
          <CartHydration />
        </I18nProvider>
      </body>
    </html>
  );
}
