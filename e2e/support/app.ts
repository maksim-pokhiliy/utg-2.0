import type { Locator, Page } from "@playwright/test";

import ukDictionary from "../../src/app/[lang]/dictionaries/uk.json" with { type: "json" };

export const UK_DICTIONARY = ukDictionary;

export const SITE_URL = "https://www.ua-tactical-gear.com";

export const CART_STORAGE_KEY = "utg-cart-v2";

export const HOME_PATH = "/uk";

export const CATEGORY_PATH = "/uk/category/patches";

export const PRODUCT_PATH = "/uk/category/patches/waiting";

export const CHECKOUT_PATH = "/uk/checkout";

export const ORDER_ROUTE_GLOB = "**/api/place_order";

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
