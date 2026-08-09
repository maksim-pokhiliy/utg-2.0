import { expect, test, type Page } from "@playwright/test";

import {
  CHECKOUT_PATH,
  CHECKOUT_PATRONYMIC,
  FORWARDED_FOR_HEADER,
  HOME_PATH,
  PRODUCT_PATH,
  SPEC_CLIENT_IPS,
  UK_DICTIONARY,
  UK_PRODUCT,
  addToCartButton,
  captureOrders,
  cartButton,
  cartDrawer,
  categoryLink,
  checkoutLink,
  fillUkCheckoutForm,
  firstNameInput,
  isRecord,
  orderToast,
  productLink,
  readCartStorage,
  readOrderSection,
  submitButton,
  submitCapturedOrder,
  successPanel,
} from "./support/app";

test.use({
  extraHTTPHeaders: { [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.order },
});

const UNCONFIGURED_RELAY_STATUS = 503;

const ORDER_ROUTE_PATH = "/api/place_order";

const EMPTY_CART_STORAGE = "[]";

const SINGLE_LINE_COUNT = 1;

const EMPTY_CART_COUNT = 0;

const ADDED_QUANTITY = 1;

const UAH_CURRENCY = "UAH";

const UK_LOCALE = "uk";

const PAYLOAD_VERSION = 2;

const CUSTOMER_KEY = "customer";

const PRESELECTED_CONTACT_CHANNEL = "call";

const NORMALIZED_PHONE = "+380675550100";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const ORDER_PAYLOAD_KEYS = [
  "cart",
  "currency",
  "customer",
  "delivery",
  "idempotency_key",
  "locale",
  "total",
  "version",
];

const CUSTOMER_KEYS = [
  "contact_channel",
  "first_name",
  "last_name",
  "patronymic",
  "phone",
];

const CART_LINE_KEYS = [
  "id",
  "image",
  "price",
  "productUrl",
  "quantity",
  "title",
];

interface IBotCartLine {
  title: unknown;
  quantity: unknown;
  productUrl: unknown;
}

interface ICapturedOrder {
  body: Record<string, unknown>;
  productUrl: string;
}

const readText = (value: unknown, key: string): string => {
  if (typeof value !== "string") {
    throw new Error(`The checkout payload carries no ${key} string`);
  }

  return value;
};

const readCartLines = (
  body: Record<string, unknown>
): Record<string, unknown>[] => {
  const { cart } = body;

  if (!Array.isArray(cart)) {
    throw new Error("The checkout payload carries no cart array");
  }

  return cart.map((line: unknown) => {
    if (!isRecord(line)) {
      throw new Error("A cart line in the checkout payload is not an object");
    }

    return line;
  });
};

const toBotLine = (line: Record<string, unknown>): IBotCartLine => ({
  title: line.title,
  quantity: line.quantity,
  productUrl: line.productUrl,
});

const placeAcceptedOrder = async (page: Page): Promise<ICapturedOrder> => {
  const bodies = await captureOrders(page);

  await page.goto(PRODUCT_PATH);

  const productUrl = page.url();

  await addToCartButton(page).click();
  await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();

  await page.goto(CHECKOUT_PATH);

  await expect(firstNameInput(page)).toBeVisible();
  await fillUkCheckoutForm(page);

  return { body: await submitCapturedOrder(page, bodies), productUrl };
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

    await expect(firstNameInput(page)).toBeVisible();
    await fillUkCheckoutForm(page);

    const orderResponse = page.waitForResponse((response) =>
      response.url().includes(ORDER_ROUTE_PATH)
    );

    await submitButton(page).click();

    expect((await orderResponse).status()).toBe(UNCONFIGURED_RELAY_STATUS);

    await expect(orderToast(page)).toContainText(
      UK_DICTIONARY.cart.order_error
    );
    await expect(successPanel(page)).toHaveCount(0);
    await expect(cartButton(page, SINGLE_LINE_COUNT)).toBeVisible();
  });

  test("sends the v2 envelope carrying the recipient, the normalized phone and the ordered line, confirms and clears the cart when the order is accepted", async ({
    page,
  }) => {
    const { body, productUrl } = await placeAcceptedOrder(page);

    expect(Object.keys(body).sort()).toEqual(ORDER_PAYLOAD_KEYS);
    expect(body.version).toBe(PAYLOAD_VERSION);
    expect(body.locale).toBe(UK_LOCALE);
    expect(body.currency).toBe(UAH_CURRENCY);
    expect(body.total).toBe((UK_PRODUCT.price * ADDED_QUANTITY).toFixed(2));
    expect(readText(body.idempotency_key, "idempotency_key")).toMatch(
      UUID_V4_PATTERN
    );

    const customer = readOrderSection(body, CUSTOMER_KEY);

    expect(Object.keys(customer).sort()).toEqual(CUSTOMER_KEYS);
    expect(customer.last_name).toBe(UK_DICTIONARY.cart.last_name_placeholder);
    expect(customer.first_name).toBe(UK_DICTIONARY.cart.first_name_placeholder);
    expect(customer.patronymic).toBe(CHECKOUT_PATRONYMIC);
    expect(customer.phone).toBe(NORMALIZED_PHONE);
    expect(customer.contact_channel).toBe(PRESELECTED_CONTACT_CHANNEL);

    const lines = readCartLines(body);

    expect(lines.map((line) => Object.keys(line).sort())).toEqual([
      CART_LINE_KEYS,
    ]);
    expect(lines.map(toBotLine)).toEqual([
      {
        title: UK_PRODUCT.title,
        quantity: ADDED_QUANTITY,
        productUrl,
      },
    ]);

    await expect(cartButton(page, EMPTY_CART_COUNT)).toBeVisible();
    expect(await readCartStorage(page)).toBe(EMPTY_CART_STORAGE);
  });
});
