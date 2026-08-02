import { expect, test, type Page, type Response } from "@playwright/test";

import {
  EN_PRODUCT,
  EN_PRODUCT_PATH,
  REPORTS_PATH,
  REPORT_COUNT,
  SITE_URL,
  UK_DICTIONARY,
  productPrice,
  reportFigureButton,
  reportThumbnail,
  viewerImage,
} from "./support/app";

const OK_STATUS = 200;

const UNLOADED_IMAGE_WIDTH = 0;

const HRYVNIA_SIGN = "₴";

const DOLLAR_SIGN = "$";

const SITEMAP_URL_COUNT = 38;

const SETTLE_FADE_MS = 600;

const PULSE_SAMPLE_GAPS_MS = [700, 800];

const CHECKOUT_SEGMENT = "/checkout";

const LOC_PATTERN = /<loc>([^<]+)<\/loc>/g;

const NOINDEX_PATTERN = /noindex/;

const UK_HOME_PATTERN = /\/uk\/?$/;

const EN_HOME_PATTERN = /\/en\/?$/;

const visit = async (page: Page, path: string): Promise<Response> => {
  const response = await page.goto(path);

  if (response === null) {
    throw new Error(`Navigating to ${path} produced no response`);
  }

  return response;
};

const expectNotFoundPage = async (page: Page): Promise<void> => {
  await expect(page.getByText(UK_DICTIONARY.not_found.title)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    NOINDEX_PATTERN
  );
};

test.describe("locale negotiation", () => {
  test.describe("a Ukrainian browser", () => {
    test.use({ locale: "uk-UA" });

    test("lands on the uk locale", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(UK_HOME_PATTERN);
    });
  });

  test.describe("an English browser", () => {
    test.use({ locale: "en-US" });

    test("lands on the en locale", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveURL(EN_HOME_PATTERN);
    });
  });
});

test.describe("dead URLs", () => {
  test.use({ locale: "uk-UA" });

  test("redirects an unknown locale prefix and serves the not-found page at 200", async ({
    page,
  }) => {
    const response = await visit(page, "/fr");

    expect(response.status()).toBe(OK_STATUS);
    await expect(page).toHaveURL(/\/uk\/fr$/);
    await expectNotFoundPage(page);
  });

  test("serves the not-found page at 200 under a valid locale", async ({
    page,
  }) => {
    const response = await visit(page, "/uk/nope");

    expect(response.status()).toBe(OK_STATUS);
    await expectNotFoundPage(page);
  });
});

test.describe("the reports gallery", () => {
  test("renders every report thumbnail from a source the server actually serves", async ({
    page,
  }) => {
    await visit(page, REPORTS_PATH);

    const thumbnails = reportThumbnail(page);

    await expect(thumbnails).toHaveCount(REPORT_COUNT);

    for (const thumbnail of await thumbnails.all()) {
      await thumbnail.scrollIntoViewIfNeeded();

      await expect
        .poll(() =>
          thumbnail.evaluate((node) =>
            node instanceof HTMLImageElement
              ? node.naturalWidth
              : UNLOADED_IMAGE_WIDTH
          )
        )
        .toBeGreaterThan(UNLOADED_IMAGE_WIDTH);
    }
  });
});

test.describe("the reports lightbox", () => {
  test("holds the settled photo perfectly still instead of pulsing it behind the skeleton", async ({
    page,
  }) => {
    await visit(page, REPORTS_PATH);

    await reportFigureButton(page).first().click();

    const viewer = page.getByRole("dialog");

    await expect(viewer).toBeVisible();

    await expect
      .poll(() =>
        viewerImage(page).evaluate((node) =>
          node instanceof HTMLImageElement
            ? node.naturalWidth
            : UNLOADED_IMAGE_WIDTH
        )
      )
      .toBeGreaterThan(UNLOADED_IMAGE_WIDTH);

    await page.waitForTimeout(SETTLE_FADE_MS);

    const settled = await viewer.screenshot();

    for (const gap of PULSE_SAMPLE_GAPS_MS) {
      await page.waitForTimeout(gap);

      expect((await viewer.screenshot()).equals(settled)).toBe(true);
    }
  });
});

test.describe("the en money path", () => {
  test("prices a product in hryvnia when the build carries no exchange rate key", async ({
    page,
  }) => {
    await visit(page, EN_PRODUCT_PATH);

    const price = await productPrice(page).innerText();

    expect(price).toContain(HRYVNIA_SIGN);
    expect(price).not.toContain(DOLLAR_SIGN);
    expect(price).toContain(EN_PRODUCT.price.toFixed(2));
  });
});

test.describe("metadata routes", () => {
  test("lists every indexable URL in the sitemap and never the checkout", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(OK_STATUS);

    const urls = [...(await response.text()).matchAll(LOC_PATTERN)].map(
      ([, url]) => url
    );

    expect(urls).toHaveLength(SITEMAP_URL_COUNT);
    expect(urls.filter((url) => url.includes(CHECKOUT_SEGMENT))).toEqual([]);
    expect(urls.filter((url) => !url.startsWith(SITE_URL))).toEqual([]);
  });

  test("serves robots.txt naming the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(OK_STATUS);
    expect(await response.text()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
