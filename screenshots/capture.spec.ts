import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  CATEGORY_PATH,
  CHECKOUT_PATH,
  EN_CATEGORY_PATH,
  HOME_PATH,
  PRODUCT_PATH,
  REPORTS_PATH,
  addToCartButton,
  cartButton,
  reportFigureButton,
  viewerImage,
} from "../e2e/support/app";

const SHOT_DIR = "screenshots";

const SHOT_QUALITY = 80;

const SETTLE_MS = 700;

const SINGLE_LINE_COUNT = 1;

const UNLOADED_IMAGE_WIDTH = 0;

const pageHeading = (page: Page): Locator =>
  page.getByRole("heading", { level: 1 });

const shoot = async (page: Page, name: string): Promise<void> => {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(SETTLE_MS);

  await page.screenshot({
    path: `${SHOT_DIR}/${name}.jpg`,
    type: "jpeg",
    quality: SHOT_QUALITY,
  });
};

test.describe("README screenshots", () => {
  test("captures the uk home", async ({ page }) => {
    await page.goto(HOME_PATH);

    await expect(pageHeading(page)).toBeVisible();

    await shoot(page, "home-uk");
  });

  test("captures a category listing", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    await expect(pageHeading(page)).toBeVisible();

    await shoot(page, "category");
  });

  test("captures the same category listing on the en locale", async ({
    page,
  }) => {
    await page.goto(EN_CATEGORY_PATH);

    await expect(pageHeading(page)).toBeVisible();

    await shoot(page, "category-en");
  });

  test("captures a product page", async ({ page }) => {
    await page.goto(PRODUCT_PATH);

    await expect(pageHeading(page)).toBeVisible();

    await shoot(page, "product");
  });

  test("captures the reports lightbox over a settled photo", async ({
    page,
  }) => {
    await page.goto(REPORTS_PATH);

    await reportFigureButton(page).first().click();

    await expect
      .poll(() =>
        viewerImage(page).evaluate((node) =>
          node instanceof HTMLImageElement
            ? node.naturalWidth
            : UNLOADED_IMAGE_WIDTH
        )
      )
      .toBeGreaterThan(UNLOADED_IMAGE_WIDTH);

    await shoot(page, "reports-lightbox");
  });

  test("captures the checkout with a real cart line", async ({ page }) => {
    await page.goto(PRODUCT_PATH);

    await addToCartButton(page).click();
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

    await page.goto(CHECKOUT_PATH);

    await shoot(page, "checkout");
  });
});
