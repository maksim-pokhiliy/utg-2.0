import { expect, test, type Page } from "@playwright/test";

import {
  CHECKOUT_PATH,
  HOME_PATH,
  ORDER_ROUTE_GLOB,
  PRODUCT_PATH,
  UK_DICTIONARY,
  addToCartButton,
  cartButton,
  cartDrawer,
  categoryLink,
  checkoutLink,
  fillCheckoutForm,
  firstNameInput,
  orderToast,
  productLink,
  readCartStorage,
  submitButton,
  successPanel,
} from "./support/app";

const OK_STATUS = 200;

const EMPTY_CART_STORAGE = "[]";

const SINGLE_LINE_COUNT = 1;

const EMPTY_CART_COUNT = 0;

const ORDER_PAYLOAD_KEYS = [
  "additional",
  "address",
  "cart",
  "city",
  "country",
  "currency",
  "first_name",
  "last_name",
  "locale",
  "state",
  "telephone",
  "total",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const submitCheckout = async (page: Page): Promise<void> => {
  await expect(firstNameInput(page)).toBeVisible();
  await fillCheckoutForm(page);
  await submitButton(page).click();
};

test.describe("the order path", () => {
  test("reports the failure and keeps the cart when the relay is unconfigured", async ({
    page,
  }) => {
    await page.goto(HOME_PATH);
    await categoryLink(page).click();
    await productLink(page).click();

    await addToCartButton(page).click();

    await expect(cartDrawer(page)).toBeVisible();
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

    await checkoutLink(page).click();
    await expect(page).toHaveURL(new RegExp(`${CHECKOUT_PATH}$`));

    await submitCheckout(page);

    await expect(orderToast(page)).toContainText(
      UK_DICTIONARY.cart.order_error
    );
    await expect(successPanel(page)).toHaveCount(0);
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();
  });

  test("sends the twelve-key bot payload, confirms and clears the cart when the order is accepted", async ({
    page,
  }) => {
    const bodies: unknown[] = [];

    await page.route(ORDER_ROUTE_GLOB, async (route) => {
      bodies.push(route.request().postDataJSON());

      await route.fulfill({
        status: OK_STATUS,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto(PRODUCT_PATH);
    await addToCartButton(page).click();
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

    await page.goto(CHECKOUT_PATH);
    await submitCheckout(page);

    await expect(successPanel(page)).toBeVisible();

    expect(bodies).toHaveLength(1);

    const [body] = bodies;

    if (!isRecord(body)) {
      throw new Error("The checkout request carried no JSON object body");
    }

    expect(Object.keys(body).sort()).toEqual(ORDER_PAYLOAD_KEYS);

    await expect(cartButton(page, EMPTY_CART_COUNT)).toBeVisible();
    expect(await readCartStorage(page)).toBe(EMPTY_CART_STORAGE);
  });
});
