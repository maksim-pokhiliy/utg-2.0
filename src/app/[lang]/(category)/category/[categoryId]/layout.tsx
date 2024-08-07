import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UTG | Merch",
  description: "Donate and fight with us",
};

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
