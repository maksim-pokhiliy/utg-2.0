import type { Metadata } from "next";

import NotFoundScreen from "@root/components/pages/NotFoundScreen";

interface INotFoundPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UTG | 404",
    robots: { index: false },
  };
}

export default async function NotFoundPage({ params }: INotFoundPageProps) {
  await params;

  return <NotFoundScreen />;
}
