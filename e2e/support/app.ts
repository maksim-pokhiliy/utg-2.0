import { expect, type Locator, type Page } from "@playwright/test";

import enDictionary from "../../src/app/[lang]/dictionaries/en.json" with { type: "json" };
import ukDictionary from "../../src/app/[lang]/dictionaries/uk.json" with { type: "json" };
import type { SettlementItem } from "../../src/app/api/np/settlements/directory";
import type {
  DeliveryMethod,
  WarehouseItem,
} from "../../src/app/api/np/warehouses/directory";
import {
  DEFAULT_NP_METHOD,
  METHOD_LABEL_KEYS,
  isWarehouseMethod,
  type NpMethod,
} from "../../src/components/checkout/delivery";
import { getProductView } from "../../src/data/catalog";
import type { Locale, ProductView } from "../../src/data/catalog.types";
import { REPORT_DIMENSIONS } from "../../src/data/reports";
import { cartQuantityLabel, cartRemoveLabel } from "../../src/utils/cartLabels";

export const UK_DICTIONARY = ukDictionary;

export const EN_DICTIONARY = enDictionary;

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

export const EN_CHECKOUT_PATH = `${EN_HOME_PATH}/checkout`;

export const REPORTS_PATH = `${HOME_PATH}/reports`;

export const REPORT_COUNT = REPORT_DIMENSIONS.length;

export const ORDER_ROUTE_GLOB = "**/api/place_order";

export const SETTLEMENTS_PATH = "/api/np/settlements";

export const WAREHOUSES_PATH = "/api/np/warehouses";

export const SETTLEMENTS_ROUTE_GLOB = `**${SETTLEMENTS_PATH}*`;

export const WAREHOUSES_ROUTE_GLOB = `**${WAREHOUSES_PATH}*`;

export const FORWARDED_FOR_HEADER = "x-forwarded-for";

export const SPEC_CLIENT_IPS = {
  navigation: "203.0.113.21",
  order: "203.0.113.22",
  persistence: "203.0.113.23",
  npDirectory: "203.0.113.24",
  checkoutSummary: "203.0.113.25",
  ukDelivery: "203.0.113.26",
  ukDeliveryFallback: "203.0.113.27",
  enGeneric: "203.0.113.28",
  ukDeliveryFocus: "203.0.113.29",
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

const NP_CITY_ID = "np_city";

const NP_WAREHOUSE_ID = "np_warehouse";

const TELEPHONE_ID = "telephone";

const STREET_ID = "street";

const BUILDING_ID = "building";

const APARTMENT_ID = "apartment";

const LISTBOX_SUFFIX = "-listbox";

const ADDED_LINE_COUNT = 1;

const SINGLE_ORDER_COUNT = 1;

const OK_STATUS = 200;

const ACCEPTED_ORDER_BODY = { ok: true };

const CITY_PARAM = "city";

const METHOD_PARAM = "method";

const QUERY_PARAM = "q";

const NO_VALUE = "";

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

export const CHECKOUT_MANUAL_CITY = UK_DICTIONARY.cart.city_placeholder;

export const CHECKOUT_MANUAL_WAREHOUSE = "Відділення №12";

export const CHECKOUT_STREET = "вул. Городоцька";

export const CHECKOUT_BUILDING = "359";

export const CHECKOUT_APARTMENT = "12";

interface CheckoutValue {
  id: string;
  value: string;
}

const UK_CONTACT_VALUES: readonly CheckoutValue[] = [
  { id: "last_name", value: UK_DICTIONARY.cart.last_name_placeholder },
  { id: "first_name", value: UK_DICTIONARY.cart.first_name_placeholder },
  { id: "patronymic", value: CHECKOUT_PATRONYMIC },
  { id: "telephone", value: UK_DICTIONARY.cart.telephone_placeholder },
];

const EN_CHECKOUT_VALUES: readonly CheckoutValue[] = [
  { id: "last_name", value: EN_DICTIONARY.cart.last_name_placeholder },
  { id: "first_name", value: EN_DICTIONARY.cart.first_name_placeholder },
  { id: "telephone", value: EN_DICTIONARY.cart.telephone_placeholder },
  { id: "country", value: EN_DICTIONARY.cart.country_placeholder },
  { id: "state", value: EN_DICTIONARY.cart.state_placeholder },
  { id: "city", value: EN_DICTIONARY.cart.city_placeholder },
  { id: "address", value: EN_DICTIONARY.cart.address_placeholder },
];

export const KYIV_QUERY = "київ";

export const VILLAGE_QUERY = "іванівка";

export const KYIV_SETTLEMENT: SettlementItem = {
  ref: "8d5a980d-391c-11dd-90d9-001a92567626",
  label: "м. Київ",
  region: "Київська обл.",
  warehouseCount: 12298,
  isCourierAllowed: true,
};

export const KYIV_CITY_LINE = "м. Київ, Київська обл.";

const BROVARY_SETTLEMENT: SettlementItem = {
  ref: "e71c03d4-4b33-11e4-ab6d-005056801329",
  label: "м. Бровари",
  region: "Київська обл.",
  warehouseCount: 47,
  isCourierAllowed: true,
};

export const KYIV_SETTLEMENTS: readonly SettlementItem[] = [
  KYIV_SETTLEMENT,
  BROVARY_SETTLEMENT,
];

export const WAREHOUSELESS_SETTLEMENT: SettlementItem = {
  ref: "e718a680-4b33-11e4-ab6d-005056801329",
  label: "с. Іванівка",
  region: "Броварський р-н, Київська обл.",
  warehouseCount: 0,
  isCourierAllowed: true,
};

export const KYIV_BRANCH: WarehouseItem = {
  number: "1",
  label: "Відділення №1: вул. Пирогівський шлях, 135",
};

const KYIV_SECOND_BRANCH: WarehouseItem = {
  number: "2",
  label: "Відділення №2: вул. Богатирська, 11",
};

export const KYIV_POSTOMAT: WarehouseItem = {
  number: "1001",
  label: 'Поштомат "Нова Пошта" №1001',
};

export const BRANCH_METHOD_PARAM: DeliveryMethod = "branch";

export const POSTOMAT_METHOD_PARAM: DeliveryMethod = "postomat";

export type WarehouseFixtures = Record<
  DeliveryMethod,
  readonly WarehouseItem[]
>;

export const KYIV_WAREHOUSES: WarehouseFixtures = {
  branch: [KYIV_BRANCH, KYIV_SECOND_BRANCH],
  postomat: [KYIV_POSTOMAT],
};

export interface WarehouseQuery {
  city: string;
  method: string;
  q: string;
}

const isDeliveryMethodParam = (value: string | null): value is DeliveryMethod =>
  value === BRANCH_METHOD_PARAM || value === POSTOMAT_METHOD_PARAM;

export const stubSettlements = async (
  page: Page,
  items: readonly SettlementItem[]
): Promise<void> => {
  await page.route(SETTLEMENTS_ROUTE_GLOB, async (route) => {
    await route.fulfill({ status: OK_STATUS, json: { items } });
  });
};

export interface HeldSettlements {
  waitForRequest: () => Promise<void>;
  release: () => void;
}

export const stubHeldSettlements = async (
  page: Page,
  items: readonly SettlementItem[]
): Promise<HeldSettlements> => {
  let signalArrival: (() => void) | null = null;
  let signalRelease: (() => void) | null = null;

  const arrived = new Promise<void>((resolve) => {
    signalArrival = resolve;
  });
  const held = new Promise<void>((resolve) => {
    signalRelease = resolve;
  });

  await page.route(SETTLEMENTS_ROUTE_GLOB, async (route) => {
    signalArrival?.();

    await held;
    await route.fulfill({ status: OK_STATUS, json: { items } });
  });

  return {
    waitForRequest: () => arrived,
    release: () => signalRelease?.(),
  };
};

export const stubWarehouses = async (
  page: Page,
  fixtures: WarehouseFixtures
): Promise<readonly WarehouseQuery[]> => {
  const queries: WarehouseQuery[] = [];

  await page.route(WAREHOUSES_ROUTE_GLOB, async (route) => {
    const { searchParams } = new URL(route.request().url());
    const method = searchParams.get(METHOD_PARAM);

    queries.push({
      city: searchParams.get(CITY_PARAM) ?? NO_VALUE,
      method: method ?? NO_VALUE,
      q: searchParams.get(QUERY_PARAM) ?? NO_VALUE,
    });

    await route.fulfill({
      status: OK_STATUS,
      json: { items: isDeliveryMethodParam(method) ? fixtures[method] : [] },
    });
  });

  return queries;
};

export const captureOrders = async (
  page: Page
): Promise<readonly unknown[]> => {
  const bodies: unknown[] = [];

  await page.route(ORDER_ROUTE_GLOB, async (route) => {
    bodies.push(route.request().postDataJSON());

    await route.fulfill({ status: OK_STATUS, json: ACCEPTED_ORDER_BODY });
  });

  return bodies;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const readOrderBody = (
  bodies: readonly unknown[]
): Record<string, unknown> => {
  const [body] = bodies;

  if (!isRecord(body)) {
    throw new Error("The checkout request carried no JSON object body");
  }

  return body;
};

export const readOrderSection = (
  body: Record<string, unknown>,
  key: string
): Record<string, unknown> => {
  const section = body[key];

  if (!isRecord(section)) {
    throw new Error(`The checkout payload carries no ${key} object`);
  }

  return section;
};

const quantityLabel = (title: string): string =>
  cartQuantityLabel(UK_DICTIONARY, title);

const removeLabel = (title: string): string =>
  cartRemoveLabel(UK_DICTIONARY, title);

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

export const enAddToCartButton = (page: Page): Locator =>
  page.getByRole("button", { name: EN_DICTIONARY.product.add, exact: true });

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

export const npCityInput = (page: Page): Locator =>
  page.locator(`#${NP_CITY_ID}`);

export const npWarehouseInput = (page: Page): Locator =>
  page.locator(`#${NP_WAREHOUSE_ID}`);

export const telephoneInput = (page: Page): Locator =>
  page.locator(`#${TELEPHONE_ID}`);

export const streetInput = (page: Page): Locator =>
  page.locator(`#${STREET_ID}`);

export const buildingInput = (page: Page): Locator =>
  page.locator(`#${BUILDING_ID}`);

export const apartmentInput = (page: Page): Locator =>
  page.locator(`#${APARTMENT_ID}`);

export const methodChip = (page: Page, method: NpMethod): Locator =>
  page.getByRole("radio", {
    name: UK_DICTIONARY.cart[METHOD_LABEL_KEYS[method]],
    exact: true,
  });

const directoryOption = (page: Page, fieldId: string, label: string): Locator =>
  page
    .locator(`#${fieldId}${LISTBOX_SUFFIX}`)
    .getByRole("option", { name: label });

export const cityOption = (page: Page, label: string): Locator =>
  directoryOption(page, NP_CITY_ID, label);

export const warehouseOption = (page: Page, label: string): Locator =>
  directoryOption(page, NP_WAREHOUSE_ID, label);

export const fallbackHint = (page: Page): Locator =>
  page.getByText(UK_DICTIONARY.cart.np_fallback_hint);

export const warehouseFallbackHint = (page: Page): Locator =>
  page.getByText(UK_DICTIONARY.cart.np_fallback_hint_warehouse);

export const submitButton = (page: Page): Locator =>
  page.locator('form button[type="submit"]');

export const successPanel = (page: Page): Locator => page.getByRole("status");

export const orderToast = (page: Page): Locator =>
  page.locator("[data-sonner-toast]");

export const openUkCheckout = async (page: Page): Promise<void> => {
  await page.goto(PRODUCT_PATH);
  await addToCartButton(page).click();
  await cartButton(page, ADDED_LINE_COUNT).waitFor();

  await page.goto(CHECKOUT_PATH);
  await firstNameInput(page).waitFor();
};

export const openEnCheckout = async (page: Page): Promise<void> => {
  await page.goto(EN_PRODUCT_PATH);
  await enAddToCartButton(page).click();
  await cartButton(page, ADDED_LINE_COUNT).waitFor();

  await page.goto(EN_CHECKOUT_PATH);
  await firstNameInput(page).waitFor();
};

const fillValues = async (
  page: Page,
  values: readonly CheckoutValue[]
): Promise<void> => {
  for (const field of values) {
    await page.locator(`#${field.id}`).fill(field.value);
  }
};

export const fillUkContactFields = (page: Page): Promise<void> =>
  fillValues(page, UK_CONTACT_VALUES);

export const fillEnCheckoutForm = (page: Page): Promise<void> =>
  fillValues(page, EN_CHECKOUT_VALUES);

interface UkCheckoutOptions {
  method?: NpMethod;
}

export const fillUkCheckoutForm = async (
  page: Page,
  { method = DEFAULT_NP_METHOD }: UkCheckoutOptions = {}
): Promise<void> => {
  await fillUkContactFields(page);

  if (method !== DEFAULT_NP_METHOD) {
    await methodChip(page, method).click();
  }

  await npCityInput(page).fill(CHECKOUT_MANUAL_CITY);
  await fallbackHint(page).waitFor();

  if (isWarehouseMethod(method)) {
    await npWarehouseInput(page).fill(CHECKOUT_MANUAL_WAREHOUSE);

    return;
  }

  await streetInput(page).fill(CHECKOUT_STREET);
  await buildingInput(page).fill(CHECKOUT_BUILDING);
};

export const submitCapturedOrder = async (
  page: Page,
  bodies: readonly unknown[]
): Promise<Record<string, unknown>> => {
  await submitButton(page).click();

  await expect(successPanel(page)).toBeVisible();
  expect(bodies).toHaveLength(SINGLE_ORDER_COUNT);

  return readOrderBody(bodies);
};

export const pickCityOption = async (
  page: Page,
  settlement: SettlementItem,
  query: string
): Promise<void> => {
  await npCityInput(page).fill(query);
  await cityOption(page, settlement.label).click();
};

export const pickWarehouseOption = async (
  page: Page,
  warehouse: WarehouseItem
): Promise<void> => {
  await npWarehouseInput(page).click();
  await warehouseOption(page, warehouse.label).click();
};

export const readCartStorage = (page: Page): Promise<string | null> =>
  page.evaluate((key) => window.localStorage.getItem(key), CART_STORAGE_KEY);
