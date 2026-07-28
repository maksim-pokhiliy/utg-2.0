import { describe, expect, it } from "vitest";

import type { Locale, ProductView } from "@root/data";
import { getProductView } from "@root/data";
import type { PageMetadataInput } from "@root/utils/seo";
import {
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  buildPageMetadata,
  buildProductJsonLd,
  capitalize,
  languageAlternates,
  localePath,
  otherLocale,
  productOgImage,
  serializeJsonLd,
} from "@root/utils/seo";

const requireProduct = (
  categorySlug: string,
  productSlug: string,
  locale: Locale
): ProductView => {
  const product = getProductView(categorySlug, productSlug, locale);

  if (product === null) {
    throw new Error(`Missing catalog product ${categorySlug}/${productSlug}`);
  }

  return product;
};

const AVAILABLE_PATCH = requireProduct("patches", "waiting", "uk");

const SOLD_OUT_TSHIRT = requireProduct("tshirts", "death-black", "uk");

const SCRIPT_INJECTION_PRODUCT: ProductView = {
  ...AVAILABLE_PATCH,
  description: "Hand sewn </script> in a Lviv workshop",
};

const CATEGORY_NAME = "Patches";

const IN_STOCK_URL = "https://schema.org/InStock";

const OUT_OF_STOCK_URL = "https://schema.org/OutOfStock";

const NEW_CONDITION_URL = "https://schema.org/NewCondition";

const LOGO_WIDTH = 640;

const LOGO_HEIGHT = 448;

const PATCH_IMAGE_WIDTH = 960;

const PATCH_IMAGE_HEIGHT = 1280;

const PAGE_PATH = "/category/patches";

const PAGE_TITLE = "Patches";

const PAGE_DESCRIPTION = "Every patch in the workshop, ready to ship.";

const UNTITLED_INPUT: PageMetadataInput = {
  locale: "en",
  path: PAGE_PATH,
  description: PAGE_DESCRIPTION,
  image: SITE_OG_IMAGE,
};

const TITLED_INPUT: PageMetadataInput = {
  ...UNTITLED_INPUT,
  title: PAGE_TITLE,
};

describe("otherLocale", () => {
  it("returns en when the current locale is uk", () => {
    expect(otherLocale("uk")).toBe("en");
  });

  it("returns uk when the current locale is en", () => {
    expect(otherLocale("en")).toBe("uk");
  });
});

describe("localePath", () => {
  it("prefixes a path with its locale segment", () => {
    expect(localePath("uk", "/about")).toBe("/uk/about");
  });

  it("renders the home path as a bare locale segment", () => {
    expect(localePath("en", "")).toBe("/en");
  });
});

describe("absoluteUrl", () => {
  it("anchors a path on the canonical site URL", () => {
    expect(absoluteUrl("/uk/about")).toBe(`${SITE_URL}/uk/about`);
  });
});

describe("capitalize", () => {
  it("uppercases the first character", () => {
    expect(capitalize("patches")).toBe("Patches");
  });

  it("leaves an already capitalised word alone", () => {
    expect(capitalize("Patches")).toBe("Patches");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("languageAlternates", () => {
  it("carries a uk, an en and an x-default entry", () => {
    expect(Object.keys(languageAlternates("/about"))).toEqual([
      "uk",
      "en",
      "x-default",
    ]);
  });

  it("maps every entry to its own absolute locale-prefixed URL", () => {
    expect(languageAlternates("/about")).toEqual({
      uk: `${SITE_URL}/uk/about`,
      en: `${SITE_URL}/en/about`,
      "x-default": `${SITE_URL}/uk/about`,
    });
  });

  it("pins x-default to the uk URL", () => {
    const alternates = languageAlternates(PAGE_PATH);

    expect(alternates["x-default"]).toBe(alternates.uk);
  });
});

describe("buildPageMetadata", () => {
  it("omits the title key entirely when no title is supplied", () => {
    expect("title" in buildPageMetadata(UNTITLED_INPUT)).toBe(false);
  });

  it("carries the supplied title", () => {
    expect(buildPageMetadata(TITLED_INPUT).title).toBe(PAGE_TITLE);
  });

  it("falls back to the site name for the open graph title", () => {
    expect(buildPageMetadata(UNTITLED_INPUT).openGraph?.title).toBe(SITE_NAME);
  });

  it("uses the supplied title as the open graph title", () => {
    expect(buildPageMetadata(TITLED_INPUT).openGraph?.title).toBe(PAGE_TITLE);
  });

  it("canonicalises the locale-prefixed absolute URL", () => {
    expect(buildPageMetadata(UNTITLED_INPUT).alternates?.canonical).toBe(
      `${SITE_URL}/en/category/patches`
    );
  });

  it("carries the full hreflang triple for the locale-neutral path", () => {
    expect(buildPageMetadata(UNTITLED_INPUT).alternates?.languages).toEqual({
      uk: `${SITE_URL}/uk/category/patches`,
      en: `${SITE_URL}/en/category/patches`,
      "x-default": `${SITE_URL}/uk/category/patches`,
    });
  });

  it("repeats the description in the open graph block", () => {
    const metadata = buildPageMetadata(UNTITLED_INPUT);

    expect(metadata.description).toBe(PAGE_DESCRIPTION);
    expect(metadata.openGraph?.description).toBe(PAGE_DESCRIPTION);
  });

  it("points the open graph URL at the canonical URL", () => {
    expect(buildPageMetadata(UNTITLED_INPUT).openGraph?.url).toBe(
      `${SITE_URL}/en/category/patches`
    );
  });

  it("declares the open graph site identity", () => {
    const metadata = buildPageMetadata(UNTITLED_INPUT);

    expect(metadata.openGraph?.siteName).toBe(SITE_NAME);
    expect(metadata.openGraph).toMatchObject({ type: "website" });
  });

  it("declares the open graph locale and its alternate", () => {
    const metadata = buildPageMetadata(UNTITLED_INPUT);

    expect(metadata.openGraph?.locale).toBe("en_US");
    expect(metadata.openGraph?.alternateLocale).toBe("uk_UA");
  });

  it("carries the supplied image as the only open graph image", () => {
    expect(buildPageMetadata(UNTITLED_INPUT).openGraph?.images).toEqual([
      SITE_OG_IMAGE,
    ]);
  });
});

describe("SITE_OG_IMAGE", () => {
  it("points at the absolute logo URL", () => {
    expect(SITE_OG_IMAGE.url).toBe(`${SITE_URL}/logo.png`);
  });

  it("carries the intrinsic dimensions of the logo", () => {
    expect(SITE_OG_IMAGE.width).toBe(LOGO_WIDTH);
    expect(SITE_OG_IMAGE.height).toBe(LOGO_HEIGHT);
  });

  it("uses the site name as alt text", () => {
    expect(SITE_OG_IMAGE.alt).toBe(SITE_NAME);
  });
});

describe("productOgImage", () => {
  it("points at the absolute product image URL", () => {
    expect(productOgImage(AVAILABLE_PATCH).url).toBe(
      `${SITE_URL}/images/products/patches_waiting.jpg`
    );
  });

  it("carries the intrinsic dimensions of the product image", () => {
    const image = productOgImage(AVAILABLE_PATCH);

    expect(image.width).toBe(PATCH_IMAGE_WIDTH);
    expect(image.height).toBe(PATCH_IMAGE_HEIGHT);
  });

  it("uses the product title as alt text", () => {
    expect(productOgImage(AVAILABLE_PATCH).alt).toBe(AVAILABLE_PATCH.title);
  });
});

describe("buildProductJsonLd", () => {
  it("declares the schema.org product context", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Product");
  });

  it("carries the localized title, category and description", () => {
    const jsonLd = buildProductJsonLd(SOLD_OUT_TSHIRT, CATEGORY_NAME, "uk");

    expect(jsonLd.name).toBe(SOLD_OUT_TSHIRT.title);
    expect(jsonLd.category).toBe(CATEGORY_NAME);
    expect(jsonLd.description).toBe(SOLD_OUT_TSHIRT.description);
  });

  it("leaves the description out for a product that has none", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd.description).toBeUndefined();
  });

  it("makes the product image absolute", () => {
    expect(buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk").image).toBe(
      `${SITE_URL}/images/products/patches_waiting.jpg`
    );
  });

  it("brands every product with the site name", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd.brand).toEqual({ "@type": "Brand", name: SITE_NAME });
  });

  it("prices the offer in hryvnia for uk", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd.offers.priceCurrency).toBe("UAH");
  });

  it("prices the offer in hryvnia for en too, because the operator charges hryvnia", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "en");

    expect(jsonLd.offers.priceCurrency).toBe("UAH");
  });

  it("carries the catalog price unconverted", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "en");

    expect(jsonLd.offers.price).toBe(AVAILABLE_PATCH.price);
  });

  it("marks an available product as in stock", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd.offers.availability).toBe(IN_STOCK_URL);
  });

  it("marks a sold-out product as out of stock", () => {
    const jsonLd = buildProductJsonLd(SOLD_OUT_TSHIRT, CATEGORY_NAME, "uk");

    expect(jsonLd.offers.availability).toBe(OUT_OF_STOCK_URL);
  });

  it("offers every product as a new item", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "uk");

    expect(jsonLd.offers.itemCondition).toBe(NEW_CONDITION_URL);
  });

  it("locale-prefixes the offer URL with the category and product slugs", () => {
    const jsonLd = buildProductJsonLd(AVAILABLE_PATCH, CATEGORY_NAME, "en");

    expect(jsonLd.offers.url).toBe(`${SITE_URL}/en/category/patches/waiting`);
  });
});

describe("serializeJsonLd", () => {
  it("escapes every angle bracket so a description cannot close the script tag", () => {
    const serialized = serializeJsonLd(
      buildProductJsonLd(SCRIPT_INJECTION_PRODUCT, CATEGORY_NAME, "uk")
    );

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c");
  });

  it("keeps the payload parseable back into the same object", () => {
    const jsonLd = buildProductJsonLd(
      SCRIPT_INJECTION_PRODUCT,
      CATEGORY_NAME,
      "uk"
    );
    const parsed: unknown = JSON.parse(serializeJsonLd(jsonLd));

    expect(parsed).toEqual(jsonLd);
  });
});
