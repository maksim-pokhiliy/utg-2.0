import type { Locale } from "@root/data";

export const SITE_URL = "https://www.ua-tactical-gear.com";

export const SITE_NAME = "Ukrainian Tactical Gear";

export const SITE_SHORT_NAME = "UTG";

export const TITLE_TEMPLATE = `%s | ${SITE_SHORT_NAME}`;

export const LOGO_PATH = "/logo.png";

export const OG_LOCALES: Record<Locale, string> = {
  uk: "uk_UA",
  en: "en_US",
};

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

export const IMAGE_DIMENSIONS: Record<
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

export const siteOgImage = (): OgImage => ({
  url: absoluteUrl(LOGO_PATH),
  ...IMAGE_DIMENSIONS[LOGO_PATH],
  alt: SITE_NAME,
});
