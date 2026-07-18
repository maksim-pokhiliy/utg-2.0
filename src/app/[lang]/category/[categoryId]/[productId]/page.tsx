import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategorySlugs, getProductSlugs, getProductView } from "@root/data";

import { resolveLocale } from "@root/utils/locale";

import ProductScreen from "@root/components/pages/ProductScreen";

interface IProductPageProps {
  params: Promise<{ lang: string; categoryId: string; productId: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategorySlugs().flatMap((categoryId) =>
    getProductSlugs(categoryId).map((productId) => ({ categoryId, productId }))
  );
}

export async function generateMetadata({
  params,
}: IProductPageProps): Promise<Metadata> {
  const { lang, categoryId, productId } = await params;
  const product = getProductView(categoryId, productId, resolveLocale(lang));

  if (!product) {
    return { title: "UTG | Merch" };
  }

  return {
    title: `${product.title} | UTG`,
    description: product.description ?? "Donate and fight with us",
  };
}

export default async function Product({ params }: IProductPageProps) {
  const { lang, categoryId, productId } = await params;
  const product = getProductView(categoryId, productId, resolveLocale(lang));

  if (!product) {
    notFound();
  }

  return <ProductScreen product={product} />;
}
