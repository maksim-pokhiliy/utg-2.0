import type { Locator, Page } from "@playwright/test";

import ukDictionary from "../../src/app/[lang]/dictionaries/uk.json" with { type: "json" };
import { getProductView } from "../../src/data/catalog";
import type { Locale, ProductView } from "../../src/data/catalog.types";
import { REPORT_DIMENSIONS } from "../../src/data/reports";

export const UK_DICTIONARY = ukDictionary;

export const SITE_URL = "https://www.ua-tactical-gear.com";

export const CART_STORAGE_KEY = "utg-cart-v2";

export const HOME_PATH = "/uk";

const EN_HOME_PATH = "/en";

const PRODUCT_CATEGORY_SLUG = "patches";

const PRODUCT_SLUG = "waiting";

export const CATEGORY_PATH = `${HOME_PATH}/category/${PRODUCT_CATEGORY_SLUG}`;

export const PRODUCT_PATH = `${CATEGORY_PATH}/${PRODUCT_SLUG}`;

export const EN_PRODUCT_PATH = `${EN_HOME_PATH}/category/${PRODUCT_CATEGORY_SLUG}/${PRODUCT_SLUG}`;

export const CHECKOUT_PATH = `${HOME_PATH}/checkout`;

export const REPORTS_PATH = `${HOME_PATH}/reports`;

export const REPORT_COUNT = REPORT_DIMENSIONS.length;

export const ORDER_ROUTE_GLOB = "**/api/place_order";

const catalogProduct = (locale: Locale): ProductView => {
  const product = getProductView(PRODUCT_CATEGORY_SLUG, PRODUCT_SLUG, locale);

  if (product === null) {
    throw new Error(
      `The catalog holds no ${PRODUCT_CATEGORY_SLUG}/${PRODUCT_SLUG} product`
    );
  }

  return product;
};

export const UK_PRODUCT = catalogProduct("uk");

export const EN_PRODUCT = catalogProduct("en");

interface CheckoutValue {
  id: string;
  value: string;
}

const CHECKOUT_VALUES: readonly CheckoutValue[] = [
  { id: "first_name", value: UK_DICTIONARY.cart.first_name_placeholder },
  { id: "last_name", value: UK_DICTIONARY.cart.last_name_placeholder },
  { id: "telephone", value: UK_DICTIONARY.cart.telephone_placeholder },
  { id: "country", value: UK_DICTIONARY.cart.country_placeholder },
  { id: "state", value: UK_DICTIONARY.cart.state_placeholder },
  { id: "city", value: UK_DICTIONARY.cart.city_placeholder },
  { id: "address", value: UK_DICTIONARY.cart.address_placeholder },
];

export const categoryLink = (page: Page): Locator =>
  page.locator(`a[href="${CATEGORY_PATH}"]`);

export const productLink = (page: Page): Locator =>
  page.locator(`a[href="${PRODUCT_PATH}"]`);

export const checkoutLink = (page: Page): Locator =>
  page.locator(`a[href="${CHECKOUT_PATH}"]`);

export const productHeading = (page: Page): Locator =>
  page.getByRole("heading", { level: 1 });

export const productPrice = (page: Page): Locator =>
  page.locator("span.type-price-big");

export const reportThumbnail = (page: Page): Locator =>
  page.locator("figure img");

export const addToCartButton = (page: Page): Locator =>
  page.getByRole("button", { name: UK_DICTIONARY.product.add, exact: true });

export const cartButton = (page: Page, count: number): Locator =>
  page.locator(`button[aria-label="Cart: ${count}"]`);

export const cartDrawer = (page: Page): Locator => page.getByRole("dialog");

export const cartLineRemoveButton = (page: Page, title: string): Locator =>
  cartDrawer(page).getByRole("button", {
    name: `${UK_DICTIONARY.cart.remove_confirm}: ${title}`,
    exact: true,
  });

export const firstNameInput = (page: Page): Locator =>
  page.locator("#first_name");

export const submitButton = (page: Page): Locator =>
  page.locator('form button[type="submit"]');

export const successPanel = (page: Page): Locator => page.getByRole("status");

export const orderToast = (page: Page): Locator =>
  page.locator("[data-sonner-toast]");

export const fillCheckoutForm = async (page: Page): Promise<void> => {
  for (const field of CHECKOUT_VALUES) {
    await page.locator(`#${field.id}`).fill(field.value);
  }
};

export const readCartStorage = (page: Page): Promise<string | null> =>
  page.evaluate((key) => window.localStorage.getItem(key), CART_STORAGE_KEY);
