import { expect, test } from "@playwright/test";

import {
  CART_STORAGE_KEY,
  PRODUCT_PATH,
  addToCartButton,
  cartButton,
  cartDrawer,
  cartLineRemoveButton,
  productHeading,
  readCartStorage,
} from "./support/app";

const SINGLE_LINE_COUNT = 1;

test.describe("cart persistence", () => {
  test("survives a reload and stores the lines as a bare JSON array", async ({
    page,
  }) => {
    await page.goto(PRODUCT_PATH);

    const title = await productHeading(page).textContent();

    if (title === null) {
      throw new Error("The product page renders no title");
    }

    await addToCartButton(page).click();
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

    await page.reload();

    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

    await cartButton(page, SINGLE_LINE_COUNT).click();

    await expect(cartDrawer(page)).toBeVisible();
    await expect(cartLineRemoveButton(page, title)).toBeVisible();

    const raw = await readCartStorage(page);

    if (raw === null) {
      throw new Error(`localStorage carries no ${CART_STORAGE_KEY} entry`);
    }

    const parsed: unknown = JSON.parse(raw);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(SINGLE_LINE_COUNT);
  });
});
