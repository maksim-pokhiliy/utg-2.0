import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import RecoilProvider from "@root/providers/RecoilProvider";
import SidebarUI from "@root/components/ui/Sidebar/SidebarUI";

import "@root/app/globals.css";
import { getDictionary } from "./dictionaries";

export async function generateStaticParams() {
  return [{ lang: "uk" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const dictionary = await getDictionary(params.lang);

  return (
    <html lang={params.lang}>
      <body className="text-black bg-site min-h-screen flex flex-col">
        <RecoilProvider dictionary={dictionary}>
          <Header />

          <main className="block flex-1 bg-site h-full">{children}</main>

          <SidebarUI />
          <Footer />
        </RecoilProvider>
      </body>
    </html>
  );
}
