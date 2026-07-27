import type { Metadata } from "next";

import type { Locale, ProductView } from "@root/data";

import { DEFAULT_LOCALE } from "./locale";

export const SITE_URL = "https://www.ua-tactical-gear.com";

export const SITE_NAME = "Ukrainian Tactical Gear";

export const SITE_SHORT_NAME = "UTG";

export const TITLE_TEMPLATE = `%s | ${SITE_SHORT_NAME}`;

export const LOGO_PATH = "/logo.png";

export const OG_LOCALES: Record<Locale, string> = {
  uk: "uk_UA",
  en: "en_US",
};

const CATEGORY_PATH = "/category";

const SCHEMA_CONTEXT = "https://schema.org";

const PRODUCT_SCHEMA_TYPE = "Product";

const OFFER_SCHEMA_TYPE = "Offer";

const BRAND_SCHEMA_TYPE = "Brand";

const IN_STOCK_URL = "https://schema.org/InStock";

const OUT_OF_STOCK_URL = "https://schema.org/OutOfStock";

const NEW_CONDITION_URL = "https://schema.org/NewCondition";

const PRICE_CURRENCY = "UAH";

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

export type LanguageAlternates = {
  uk: string;
  en: string;
  "x-default": string;
};

export interface PageMetadataInput {
  locale: Locale;
  path: string;
  title?: string;
  description: string;
  image: OgImage;
}

export interface ProductBrand {
  "@type": typeof BRAND_SCHEMA_TYPE;
  name: typeof SITE_NAME;
}

export interface ProductOffer {
  "@type": typeof OFFER_SCHEMA_TYPE;
  price: number;
  priceCurrency: typeof PRICE_CURRENCY;
  availability: typeof IN_STOCK_URL | typeof OUT_OF_STOCK_URL;
  itemCondition: typeof NEW_CONDITION_URL;
  url: string;
}

export interface ProductJsonLd {
  "@context": typeof SCHEMA_CONTEXT;
  "@type": typeof PRODUCT_SCHEMA_TYPE;
  name: string;
  image: string;
  category: string;
  description?: string;
  brand: ProductBrand;
  offers: ProductOffer;
}

const IMAGE_DIMENSIONS: Record<
  string,
  { width: number; height: number } | undefined
> = {
  "/logo.png": { width: 640, height: 448 },
  "/images/products/BLACK.jpg": { width: 2000, height: 2000 },
  "/images/products/BLACK1.jpg": { width: 2000, height: 2000 },
  "/images/products/GREEN.jpg": { width: 2000, height: 2000 },
  "/images/products/GREEN1.jpg": { width: 2000, height: 2000 },
  "/images/products/GREY.jpg": { width: 2000, height: 2000 },
  "/images/products/GREY1.jpg": { width: 2000, height: 2000 },
  "/images/products/patches_waiting.jpg": { width: 960, height: 1280 },
  "/images/products/patches_welcome.jpg": { width: 960, height: 1280 },
  "/images/products/patches_with_you.jpg": { width: 960, height: 1280 },
  "/images/products/patches_utg.jpg": { width: 931, height: 1080 },
  "/images/products/patches_set.jpg": { width: 960, height: 1280 },
  "/images/products/stickers2.JPG": { width: 1200, height: 1600 },
};

export const otherLocale = (locale: Locale): Locale =>
  locale === "uk" ? "en" : "uk";

export const localePath = (locale: Locale, path: string): string =>
  `/${locale}${path}`;

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const languageAlternates = (path: string): LanguageAlternates => ({
  uk: absoluteUrl(localePath("uk", path)),
  en: absoluteUrl(localePath("en", path)),
  "x-default": absoluteUrl(localePath(DEFAULT_LOCALE, path)),
});

export const siteOgImage = (): OgImage => ({
  url: absoluteUrl(LOGO_PATH),
  ...IMAGE_DIMENSIONS[LOGO_PATH],
  alt: SITE_NAME,
});

export const productOgImage = (product: ProductView): OgImage => ({
  url: absoluteUrl(product.image),
  ...IMAGE_DIMENSIONS[product.image],
  alt: product.title,
});

const productPath = (product: ProductView): string =>
  `${CATEGORY_PATH}/${product.category}/${product.slug}`;

export const buildProductJsonLd = (
  product: ProductView,
  categoryName: string,
  locale: Locale
): ProductJsonLd => ({
  "@context": SCHEMA_CONTEXT,
  "@type": PRODUCT_SCHEMA_TYPE,
  name: product.title,
  image: absoluteUrl(product.image),
  category: categoryName,
  description: product.description,
  brand: { "@type": BRAND_SCHEMA_TYPE, name: SITE_NAME },
  offers: {
    "@type": OFFER_SCHEMA_TYPE,
    price: product.price,
    priceCurrency: PRICE_CURRENCY,
    availability: product.isAvailable ? IN_STOCK_URL : OUT_OF_STOCK_URL,
    itemCondition: NEW_CONDITION_URL,
    url: absoluteUrl(localePath(locale, productPath(product))),
  },
});

export const serializeJsonLd = (data: ProductJsonLd): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export const buildPageMetadata = ({
  locale,
  path,
  title,
  description,
  image,
}: PageMetadataInput): Metadata => {
  const url = absoluteUrl(localePath(locale, path));

  return {
    ...(title === undefined ? {} : { title }),
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: OG_LOCALES[otherLocale(locale)],
      url,
      title: title ?? SITE_NAME,
      description,
      images: [image],
    },
  };
};
