import { describe, expect, it } from "vitest";

import sitemap from "@root/app/sitemap";
import { getCategorySlugs, getProductSlugs } from "@root/data";
import { LOCALES } from "@root/utils/locale";
import { SITE_URL, languageAlternates } from "@root/utils/seo";

const STATIC_PATHS = ["", "/category", "/reports", "/about"];

const STATIC_PATH_COUNT = STATIC_PATHS.length;

const EXPECTED_ENTRY_COUNT = 38;

const ALTERNATE_LANGUAGE_KEYS = ["uk", "en", "x-default"];

const catalogPathCount = (): number =>
  getCategorySlugs().reduce(
    (total, categorySlug) => total + 1 + getProductSlugs(categorySlug).length,
    0
  );

const pathCount = (): number => STATIC_PATH_COUNT + catalogPathCount();

describe("sitemap", () => {
  it("lists every indexable URL of the shop", () => {
    expect(sitemap()).toHaveLength(EXPECTED_ENTRY_COUNT);
  });

  it("emits one entry per locale for every static, category and product path", () => {
    expect(sitemap()).toHaveLength(LOCALES.length * pathCount());
  });

  it("repeats the whole path set once per locale", () => {
    const entries = sitemap();
    const perLocaleCounts = LOCALES.map(
      (locale) =>
        entries.filter((entry) => entry.url.startsWith(`${SITE_URL}/${locale}`))
          .length
    );

    expect(perLocaleCounts).toEqual(LOCALES.map(() => pathCount()));
  });

  it("lists the home, category index, reports and about pages", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining(
        STATIC_PATHS.map((path) => `${SITE_URL}/uk${path}`)
      )
    );
  });

  it("lists every catalog product under its own category", () => {
    const urls = sitemap().map((entry) => entry.url);
    const productUrls = LOCALES.flatMap((locale) =>
      getCategorySlugs().flatMap((categorySlug) =>
        getProductSlugs(categorySlug).map(
          (productSlug) =>
            `${SITE_URL}/${locale}/category/${categorySlug}/${productSlug}`
        )
      )
    );

    expect(urls).toEqual(expect.arrayContaining(productUrls));
  });

  it("anchors every URL on the canonical site URL", () => {
    const foreign = sitemap()
      .map((entry) => entry.url)
      .filter((url) => !url.startsWith(`${SITE_URL}/`));

    expect(foreign).toEqual([]);
  });

  it("never lists the same URL twice", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("keeps checkout out of the index", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("/checkout"));

    expect(urls).toEqual([]);
  });

  it("carries the full alternates triple on every entry", () => {
    const keySets = sitemap().map((entry) =>
      Object.keys(entry.alternates?.languages ?? {}).join(",")
    );

    expect([...new Set(keySets)]).toEqual([ALTERNATE_LANGUAGE_KEYS.join(",")]);
  });

  it("pins x-default to the uk alternate on every entry", () => {
    const mismatched = sitemap().filter((entry) => {
      const languages = entry.alternates?.languages;

      return languages?.["x-default"] !== languages?.uk;
    });

    expect(mismatched).toEqual([]);
  });

  it("points the alternates of an entry at its own locale-neutral path", () => {
    const entry = sitemap().find(
      (candidate) => candidate.url === `${SITE_URL}/en/about`
    );

    expect(entry?.alternates?.languages).toEqual(languageAlternates("/about"));
  });
});
