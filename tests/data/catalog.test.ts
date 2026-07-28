import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getCategorySlugs,
  getCategorySummaries,
  getProductSlugs,
  getProductView,
  REPORT_DIMENSIONS,
  type ImageSize,
  type ProductView,
} from "@root/data";
import { LOGO_PATH, LOGO_SIZE } from "@root/utils/seo";

import { readImageSize } from "../support/imageHeader";

const PUBLIC_DIR = "public";
const REPORTS_DIR = join(PUBLIC_DIR, "images", "reports");
const REPORT_FILE_PATTERN = /^report_\d+\.jpg$/;
const LOWERCASE_SLUG_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_LOCALE = "uk";

const publicPath = (imagePath: string): string =>
  join(PUBLIC_DIR, imagePath.replace(/^\//, ""));

const requireImageSize = (imagePath: string): ImageSize => {
  const filePath = publicPath(imagePath);
  const size = readImageSize(filePath);

  if (size === null) {
    throw new Error(`Unreadable image header at ${filePath}`);
  }

  return size;
};

const requireProduct = (
  categorySlug: string,
  productSlug: string
): ProductView => {
  const product = getProductView(categorySlug, productSlug, DEFAULT_LOCALE);

  if (product === null) {
    throw new Error(`Missing product ${categorySlug}/${productSlug}`);
  }

  return product;
};

const allProducts = getCategorySlugs().flatMap((categorySlug) =>
  getProductSlugs(categorySlug).map((productSlug) =>
    requireProduct(categorySlug, productSlug)
  )
);

const reportFiles = readdirSync(REPORTS_DIR)
  .filter((name) => REPORT_FILE_PATTERN.test(name))
  .sort();

describe("the declared catalog image dimensions", () => {
  it.each(allProducts.map((product) => [product.slug, product] as const))(
    "matches the real file header for %s",
    (_slug, product) => {
      expect(requireImageSize(product.image)).toEqual(product.imageSize);
    }
  );

  it.each(allProducts.map((product) => [product.slug, product] as const))(
    "points at an image file that exists for %s",
    (_slug, product) => {
      expect(existsSync(publicPath(product.image))).toBe(true);
    }
  );

  it("covers every product in the catalog", () => {
    expect(allProducts).toHaveLength(12);
  });
});

describe("the declared category image paths", () => {
  it.each(
    getCategorySummaries(DEFAULT_LOCALE).map(
      (category) => [category.slug, category.image] as const
    )
  )("points at an image file that exists for %s", (_slug, image) => {
    expect(existsSync(publicPath(image))).toBe(true);
  });
});

describe("the declared logo dimensions", () => {
  it("matches the real file header", () => {
    expect(requireImageSize(LOGO_PATH)).toEqual(LOGO_SIZE);
  });

  it("points at an image file that exists", () => {
    expect(existsSync(publicPath(LOGO_PATH))).toBe(true);
  });
});

describe("the declared report dimensions", () => {
  it.each(REPORT_DIMENSIONS.map((size, index) => [index + 1, size] as const))(
    "matches the real file header for report %i",
    (number, size) => {
      expect(requireImageSize(`/images/reports/report_${number}.jpg`)).toEqual(
        size
      );
    }
  );

  it("declares exactly as many entries as there are report files on disk", () => {
    expect(REPORT_DIMENSIONS).toHaveLength(reportFiles.length);
  });
});

describe("the catalog structure", () => {
  it.each(allProducts.map((product) => [product.slug] as const))(
    "keeps the url slug lowercase for %s",
    (slug) => {
      expect(slug).toMatch(LOWERCASE_SLUG_PATTERN);
    }
  );

  it.each(allProducts.map((product) => [product.slug, product] as const))(
    "prices %s as a positive integer number of hryvnia",
    (_slug, product) => {
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
    }
  );

  it.each(allProducts.map((product) => [product.slug, product] as const))(
    "files %s under a category the catalog declares",
    (_slug, product) => {
      expect(getCategorySlugs()).toContain(product.category);
    }
  );

  it("gives every product a unique slug within its category", () => {
    const identities = allProducts.map(
      (product) => `${product.category}/${product.slug}`
    );

    expect(new Set(identities).size).toBe(identities.length);
  });
});
