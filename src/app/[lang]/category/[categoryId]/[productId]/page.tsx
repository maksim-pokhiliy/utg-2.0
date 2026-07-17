import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCategorySlugs,
  getProductSlugs,
  getProductView,
  resolveLocale,
} from "@root/data";

import ProductScreen from "@root/components/pages/ProductScreen";

interface IProductPageProps {
  params: { lang: string; categoryId: string; productId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategorySlugs().flatMap((categoryId) =>
    getProductSlugs(categoryId).map((productId) => ({ categoryId, productId }))
  );
}

export function generateMetadata({ params }: IProductPageProps): Metadata {
  const product = getProductView(
    params.categoryId,
    params.productId,
    resolveLocale(params.lang)
  );

  if (!product) {
    return { title: "UTG | Merch" };
  }

  return {
    title: `${product.title} | UTG`,
    description: product.description ?? "Donate and fight with us",
  };
}

export default function Product({ params }: IProductPageProps) {
  const product = getProductView(
    params.categoryId,
    params.productId,
    resolveLocale(params.lang)
  );

  if (!product) {
    notFound();
  }

  return <ProductScreen product={product} />;
}
