import type { MetadataRoute } from "next";

import type { Locale } from "@root/data";
import { getCategorySlugs, getProductSlugs } from "@root/data";
import { absoluteUrl, languageAlternates, localePath } from "@root/utils/seo";

const LOCALES: Locale[] = ["uk", "en"];

const CATEGORY_PATH = "/category";

const STATIC_PATHS = ["", CATEGORY_PATH, "/reports", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...getCategorySlugs().flatMap((categorySlug) => [
      `${CATEGORY_PATH}/${categorySlug}`,
      ...getProductSlugs(categorySlug).map(
        (productSlug) => `${CATEGORY_PATH}/${categorySlug}/${productSlug}`
      ),
    ]),
  ];

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      alternates: { languages: languageAlternates(path) },
    }))
  );
}
