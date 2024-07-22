import Footer from "@root/components/layout/Footer";
import Header from "@root/components/layout/Header";
import RecoilProvider from "@root/providers/RecoilProvider";
import SidebarUI from "@root/components/ui/Sidebar/SidebarUI";

import "@root/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-black bg-site min-h-screen flex flex-col">
        <RecoilProvider>
          <Header />

          <main className="block flex-1 bg-site h-full">{children}</main>

          <SidebarUI />
          <Footer />
        </RecoilProvider>
      </body>
    </html>
  );
}
