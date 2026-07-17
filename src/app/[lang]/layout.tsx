import { getDictionary } from "./dictionaries";

import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import RecoilProvider from "@root/providers/RecoilProvider";
import SidebarUI from "@root/components/ui/Sidebar/SidebarUI";

import "@root/app/globals.css";
import { currencyMap, resolveMoney } from "@root/utils/formatPrice";

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
  params: { lang: keyof typeof currencyMap };
}>) {
  const dictionary = await getDictionary(params.lang);
  const conversionRates = await getConversionRates();
  const money = resolveMoney(params.lang, conversionRates);

  return (
    <html lang={params.lang}>
      <body className="text-black bg-site min-h-screen flex flex-col">
        <RecoilProvider lang={params.lang} dictionary={dictionary} money={money}>
          <Header />

          <main className="block flex-1 bg-site h-full">{children}</main>

          <SidebarUI />
          <Footer />
        </RecoilProvider>
      </body>
    </html>
  );
}
