import { expect, test, type Page } from "@playwright/test";

import {
  CATEGORY_PATH,
  CHECKOUT_PATH,
  EN_HOME_PATH,
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

    await shoot(page, "home-uk");
  });

  test("captures the en home", async ({ page }) => {
    await page.goto(EN_HOME_PATH);

    await shoot(page, "home-en");
  });

  test("captures a category listing", async ({ page }) => {
    await page.goto(CATEGORY_PATH);

    await shoot(page, "category");
  });

  test("captures a product page", async ({ page }) => {
    await page.goto(PRODUCT_PATH);

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
