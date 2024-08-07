import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UTG | Main",
  description: "Donate and fight with us",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
