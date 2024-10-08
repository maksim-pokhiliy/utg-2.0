import { getDictionary } from "./dictionaries";

import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import RecoilProvider from "@root/providers/RecoilProvider";
import SidebarUI from "@root/components/ui/Sidebar/SidebarUI";

import "@root/app/globals.css";
import { currencyMap } from "@root/utils/formatPrice";

export async function generateStaticParams() {
  return [{ lang: "uk" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: keyof typeof currencyMap };
}>) {
  const dictionary = await getDictionary(params.lang);

  const conversionRates = await fetch(
    `${process.env.EXCHANGE_RATE_API_URL}/${process.env.EXCHANGE_RATE_API_KEY}/latest/UAH`
  ).then((data) => data.json());

  return (
    <html lang={params.lang}>
      <head>
        <link
          rel="icon"
          href="https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/hero%2Ffavicon.ico?alt=media&token=22d59388-3243-4d61-8e4b-19e1f887405b"
          sizes="any"
        />
      </head>

      <body className="text-black bg-site min-h-screen flex flex-col">
        <RecoilProvider
          lang={params.lang}
          dictionary={dictionary}
          exchangeRates={conversionRates.conversion_rates}
        >
          <Header />

          <main className="block flex-1 bg-site h-full">{children}</main>

          <SidebarUI />
          <Footer />
        </RecoilProvider>
      </body>
    </html>
  );
}
