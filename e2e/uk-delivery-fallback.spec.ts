import { expect, test } from "@playwright/test";

import {
  CHECKOUT_BUILDING,
  CHECKOUT_MANUAL_CITY,
  CHECKOUT_MANUAL_WAREHOUSE,
  CHECKOUT_STREET,
  FORWARDED_FOR_HEADER,
  KYIV_CITY_LINE,
  KYIV_QUERY,
  KYIV_SETTLEMENT,
  KYIV_SETTLEMENTS,
  SPEC_CLIENT_IPS,
  captureOrders,
  fallbackHint,
  fillUkCheckoutForm,
  fillUkContactFields,
  npCityInput,
  npWarehouseInput,
  openUkCheckout,
  pickCityOption,
  readOrderSection,
  stubSettlements,
  submitCapturedOrder,
  warehouseFallbackHint,
} from "./support/app";

test.use({
  extraHTTPHeaders: {
    [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.ukDeliveryFallback,
  },
});

const DELIVERY_KEY = "delivery";

const BRANCH_MODE = "np_branch";

const COURIER_MODE = "np_courier";

const MANUAL_SOURCE = "manual";

const ROLE_ATTRIBUTE = "role";

const COMBOBOX_ROLE = "combobox";

const MANUAL_WAREHOUSE_KEYS = ["city", "mode", "source", "warehouse"];

const MANUAL_COURIER_KEYS = ["building", "city", "mode", "source", "street"];

test.describe("the uk delivery fallback", () => {
  test("turns both directory fields into free text and still places the branch order when the whole directory is down", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await openUkCheckout(page);
    await fillUkCheckoutForm(page);

    await expect(fallbackHint(page)).toBeVisible();
    await expect(npCityInput(page)).not.toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );
    await expect(npWarehouseInput(page)).not.toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );
    await expect(npCityInput(page)).toHaveValue(CHECKOUT_MANUAL_CITY);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(MANUAL_WAREHOUSE_KEYS);
    expect(delivery.mode).toBe(BRANCH_MODE);
    expect(delivery.source).toBe(MANUAL_SOURCE);
    expect(delivery.city).toBe(CHECKOUT_MANUAL_CITY);
    expect(delivery.warehouse).toBe(CHECKOUT_MANUAL_WAREHOUSE);
    expect(delivery.warehouse_number).toBeUndefined();
  });

  test("keeps the settlement the directory did answer and still places the order when only the warehouse lookup is down", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await stubSettlements(page, KYIV_SETTLEMENTS);

    await openUkCheckout(page);
    await fillUkContactFields(page);
    await pickCityOption(page, KYIV_SETTLEMENT, KYIV_QUERY);

    await npWarehouseInput(page).click();

    await expect(warehouseFallbackHint(page)).toBeVisible();
    await expect(npCityInput(page)).toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );

    await npWarehouseInput(page).fill(CHECKOUT_MANUAL_WAREHOUSE);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(MANUAL_WAREHOUSE_KEYS);
    expect(delivery.mode).toBe(BRANCH_MODE);
    expect(delivery.source).toBe(MANUAL_SOURCE);
    expect(delivery.city).toBe(KYIV_CITY_LINE);
    expect(delivery.warehouse).toBe(CHECKOUT_MANUAL_WAREHOUSE);
    expect(delivery.warehouse_number).toBeUndefined();
  });

  test("still places the courier order from a hand-typed address when the directory is down", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await openUkCheckout(page);
    await fillUkCheckoutForm(page, { method: COURIER_MODE });

    await expect(fallbackHint(page)).toBeVisible();

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(MANUAL_COURIER_KEYS);
    expect(delivery.mode).toBe(COURIER_MODE);
    expect(delivery.source).toBe(MANUAL_SOURCE);
    expect(delivery.city).toBe(CHECKOUT_MANUAL_CITY);
    expect(delivery.street).toBe(CHECKOUT_STREET);
    expect(delivery.building).toBe(CHECKOUT_BUILDING);
  });
});
