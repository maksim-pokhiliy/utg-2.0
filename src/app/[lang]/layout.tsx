import { getDictionary } from "./dictionaries";

import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import SidebarUI from "@root/components/ui/Sidebar/SidebarUI";
import CartHydration from "@root/components/ui/CartHydration";
import { I18nProvider } from "@root/i18n";

import "@root/app/globals.css";
import { resolveMoney } from "@root/utils/formatPrice";
import { resolveLocale } from "@root/utils/locale";

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
    <html lang={locale}>
      <body className="text-black bg-site min-h-screen flex flex-col">
        <I18nProvider locale={locale} dictionary={dictionary} money={money}>
          <Header />

          <main className="block flex-1 bg-site h-full">{children}</main>

          <SidebarUI />
          <Footer />

          <CartHydration />
        </I18nProvider>
      </body>
    </html>
  );
}
