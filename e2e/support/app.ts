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

const SECOND_PRODUCT_SLUG = "set";

export const CATEGORY_PATH = `${HOME_PATH}/category/${PRODUCT_CATEGORY_SLUG}`;

export const PRODUCT_PATH = `${CATEGORY_PATH}/${PRODUCT_SLUG}`;

export const SECOND_PRODUCT_PATH = `${CATEGORY_PATH}/${SECOND_PRODUCT_SLUG}`;

export const EN_CATEGORY_PATH = `${EN_HOME_PATH}/category/${PRODUCT_CATEGORY_SLUG}`;

export const EN_PRODUCT_PATH = `${EN_CATEGORY_PATH}/${PRODUCT_SLUG}`;

export const CHECKOUT_PATH = `${HOME_PATH}/checkout`;

export const REPORTS_PATH = `${HOME_PATH}/reports`;

export const REPORT_COUNT = REPORT_DIMENSIONS.length;

export const ORDER_ROUTE_GLOB = "**/api/place_order";

export const SETTLEMENTS_PATH = "/api/np/settlements";

export const WAREHOUSES_PATH = "/api/np/warehouses";

export const FORWARDED_FOR_HEADER = "x-forwarded-for";

export const SPEC_CLIENT_IPS = {
  navigation: "203.0.113.21",
  order: "203.0.113.22",
  persistence: "203.0.113.23",
  npDirectory: "203.0.113.24",
  checkoutSummary: "203.0.113.25",
} as const;

const specClientIps = Object.values(SPEC_CLIENT_IPS);

if (new Set(specClientIps).size !== specClientIps.length) {
  throw new Error(
    "SPEC_CLIENT_IPS must hold a unique address per spec — duplicates share one rate-limit bucket"
  );
}

const CART_BUTTON_TESTID = "cart-button";

const PRODUCT_PRICE_TESTID = "product-price";

const CHECKOUT_SUMMARY_TESTID = "checkout-summary";

const LINE_TOTAL_SELECTOR = "span.type-price";

const SUMMARY_TOTAL_SELECTOR = "span.type-price-big";

const INCREMENT_SUFFIX = "+";

const catalogProduct = (slug: string, locale: Locale): ProductView => {
  const product = getProductView(PRODUCT_CATEGORY_SLUG, slug, locale);

  if (product === null) {
    throw new Error(
      `The catalog holds no ${PRODUCT_CATEGORY_SLUG}/${slug} product`
    );
  }

  return product;
};

export const UK_PRODUCT = catalogProduct(PRODUCT_SLUG, "uk");

export const EN_PRODUCT = catalogProduct(PRODUCT_SLUG, "en");

export const UK_SECOND_PRODUCT = catalogProduct(SECOND_PRODUCT_SLUG, "uk");

export const CHECKOUT_PATRONYMIC = "Іванівна";

interface CheckoutValue {
  id: string;
  value: string;
}

const CHECKOUT_VALUES: readonly CheckoutValue[] = [
  { id: "last_name", value: UK_DICTIONARY.cart.last_name_placeholder },
  { id: "first_name", value: UK_DICTIONARY.cart.first_name_placeholder },
  { id: "patronymic", value: CHECKOUT_PATRONYMIC },
  { id: "telephone", value: UK_DICTIONARY.cart.telephone_placeholder },
  { id: "country", value: UK_DICTIONARY.cart.country_placeholder },
  { id: "state", value: UK_DICTIONARY.cart.state_placeholder },
  { id: "city", value: UK_DICTIONARY.cart.city_placeholder },
  { id: "address", value: UK_DICTIONARY.cart.address_placeholder },
];

const quantityLabel = (title: string): string =>
  `${UK_DICTIONARY.shared.quantity}: ${title}`;

const removeLabel = (title: string): string =>
  `${UK_DICTIONARY.cart.remove_confirm}: ${title}`;

export const categoryLink = (page: Page): Locator =>
  page.locator(`a[href="${CATEGORY_PATH}"]`);

export const productLink = (page: Page): Locator =>
  page.locator(`a[href="${PRODUCT_PATH}"]`);

export const checkoutLink = (page: Page): Locator =>
  page.locator(`a[href="${CHECKOUT_PATH}"]`);

export const productHeading = (page: Page): Locator =>
  page.getByRole("heading", { level: 1 });

export const productPrice = (page: Page): Locator =>
  page.getByTestId(PRODUCT_PRICE_TESTID);

export const reportThumbnail = (page: Page): Locator =>
  page.locator("figure img");

export const reportFigureButton = (page: Page): Locator =>
  page.locator("figure button");

export const viewerImage = (page: Page): Locator =>
  page.getByRole("dialog").locator("img");

export const addToCartButton = (page: Page): Locator =>
  page.getByRole("button", { name: UK_DICTIONARY.product.add, exact: true });

export const cartButton = (page: Page, count: number): Locator =>
  page.locator(
    `[data-testid="${CART_BUTTON_TESTID}"][data-cart-count="${count}"]`
  );

const dialog = (page: Page): Locator => page.getByRole("dialog");

export const cartDrawer = (page: Page): Locator => dialog(page);

export const cartLineRemoveButton = (page: Page, title: string): Locator =>
  cartDrawer(page).getByRole("button", {
    name: removeLabel(title),
    exact: true,
  });

export const checkoutSummary = (page: Page): Locator =>
  page.getByTestId(CHECKOUT_SUMMARY_TESTID);

export const summaryQuantityInput = (page: Page, title: string): Locator =>
  checkoutSummary(page).getByRole("spinbutton", {
    name: quantityLabel(title),
    exact: true,
  });

export const summaryIncrementButton = (page: Page, title: string): Locator =>
  checkoutSummary(page).getByRole("button", {
    name: `${quantityLabel(title)} ${INCREMENT_SUFFIX}`,
    exact: true,
  });

export const summaryRemoveButton = (page: Page, title: string): Locator =>
  checkoutSummary(page).getByRole("button", {
    name: removeLabel(title),
    exact: true,
  });

export const summaryLine = (page: Page, title: string): Locator =>
  checkoutSummary(page)
    .locator("div")
    .filter({
      has: page.getByRole("spinbutton", {
        name: quantityLabel(title),
        exact: true,
      }),
    })
    .filter({
      has: page.getByRole("button", { name: removeLabel(title), exact: true }),
    })
    .last();

export const summaryLineTotal = (page: Page, title: string): Locator =>
  summaryLine(page, title).locator(LINE_TOTAL_SELECTOR);

export const summaryTotal = (page: Page): Locator =>
  checkoutSummary(page).locator(SUMMARY_TOTAL_SELECTOR);

export const confirmDialog = (page: Page): Locator => dialog(page);

export const confirmCancelButton = (page: Page): Locator =>
  confirmDialog(page).getByRole("button", {
    name: UK_DICTIONARY.cart.remove_cancel,
    exact: true,
  });

export const confirmRemoveButton = (page: Page): Locator =>
  confirmDialog(page).getByRole("button", {
    name: UK_DICTIONARY.cart.remove_confirm,
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
