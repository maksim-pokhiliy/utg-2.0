import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCategoryName,
  getCategorySlugs,
  getProductSlugs,
  getProductView,
} from "@root/data";

import { resolveLocale } from "@root/utils/locale";
import { buildPageMetadata, capitalize, productOgImage } from "@root/utils/seo";

import ProductScreen from "@root/components/pages/ProductScreen";

import { getDictionary } from "../../../dictionaries";

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
  const locale = resolveLocale(lang);
  const product = getProductView(categoryId, productId, locale);
  const categoryName = getCategoryName(categoryId, locale);
  const dictionary = getDictionary(locale);

  if (!product || categoryName === null) {
    return { title: capitalize(dictionary.shared.merch) };
  }

  return buildPageMetadata({
    locale,
    path: `/category/${categoryId}/${productId}`,
    title: product.title,
    description: `${product.title} — ${categoryName}. ${
      product.description ?? dictionary.footer.mission
    }`,
    image: productOgImage(product),
  });
}

export default async function Product({ params }: IProductPageProps) {
  const { lang, categoryId, productId } = await params;
  const locale = resolveLocale(lang);
  const product = getProductView(categoryId, productId, locale);
  const categoryName = getCategoryName(categoryId, locale);

  if (!product || categoryName === null) {
    notFound();
  }

  return (
    <ProductScreen
      key={`${categoryId}/${productId}`}
      product={product}
      categoryName={categoryName}
    />
  );
}
