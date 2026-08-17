import { expect, test } from "@playwright/test";

import {
  CHECKOUT_APARTMENT,
  CHECKOUT_BUILDING,
  CHECKOUT_STREET,
  FORWARDED_FOR_HEADER,
  KYIV_BRANCH,
  KYIV_CITY_LINE,
  KYIV_POSTOMAT,
  KYIV_QUERY,
  KYIV_SETTLEMENT,
  KYIV_SETTLEMENTS,
  KYIV_WAREHOUSES,
  POSTOMAT_METHOD_PARAM,
  SPEC_CLIENT_IPS,
  UK_DICTIONARY,
  VILLAGE_QUERY,
  WAREHOUSELESS_SETTLEMENT,
  apartmentInput,
  buildingInput,
  captureOrders,
  fillUkContactFields,
  methodChip,
  npCityInput,
  npWarehouseInput,
  openUkCheckout,
  pickCityOption,
  pickWarehouseOption,
  readOrderSection,
  streetInput,
  stubSettlements,
  stubWarehouses,
  submitCapturedOrder,
} from "./support/app";

test.use({
  extraHTTPHeaders: { [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.ukDelivery },
});

const DELIVERY_KEY = "delivery";

const BRANCH_METHOD = "np_branch";

const POSTOMAT_METHOD = "np_postomat";

const COURIER_METHOD = "np_courier";

const DIRECTORY_SOURCE = "np_directory";

const EMPTY_QUERY = "";

const ARIA_DISABLED = "aria-disabled";

const ARIA_CHECKED = "aria-checked";

const FLAG_SET = "true";

const GONE = 0;

const WAREHOUSE_DELIVERY_KEYS = [
  "city",
  "mode",
  "source",
  "warehouse",
  "warehouse_number",
];

const COURIER_DELIVERY_KEYS = [
  "apartment",
  "building",
  "city",
  "mode",
  "source",
  "street",
];

test.describe("the uk Нова Пошта delivery path", () => {
  test("ships the branch pick as np_branch carrying the rejoined city and the warehouse number", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await stubSettlements(page, KYIV_SETTLEMENTS);
    await stubWarehouses(page, KYIV_WAREHOUSES);

    await openUkCheckout(page);
    await fillUkContactFields(page);

    await pickCityOption(page, KYIV_SETTLEMENT, KYIV_QUERY);

    await expect(npCityInput(page)).toHaveValue(KYIV_SETTLEMENT.label);

    await pickWarehouseOption(page, KYIV_BRANCH);

    await expect(npWarehouseInput(page)).toHaveValue(KYIV_BRANCH.label);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(WAREHOUSE_DELIVERY_KEYS);
    expect(delivery.mode).toBe(BRANCH_METHOD);
    expect(delivery.source).toBe(DIRECTORY_SOURCE);
    expect(delivery.city).toBe(KYIV_CITY_LINE);
    expect(delivery.warehouse).toBe(KYIV_BRANCH.label);
    expect(delivery.warehouse_number).toBe(KYIV_BRANCH.number);
  });

  test("re-queries the directory for the postomat category when the buyer switches the chip, and ships np_postomat", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await stubSettlements(page, KYIV_SETTLEMENTS);

    const warehouseQueries = await stubWarehouses(page, KYIV_WAREHOUSES);

    await openUkCheckout(page);
    await fillUkContactFields(page);

    await pickCityOption(page, KYIV_SETTLEMENT, KYIV_QUERY);
    await methodChip(page, POSTOMAT_METHOD).click();
    await pickWarehouseOption(page, KYIV_POSTOMAT);

    await expect(npWarehouseInput(page)).toHaveValue(KYIV_POSTOMAT.label);

    expect(warehouseQueries).toEqual([
      {
        city: KYIV_SETTLEMENT.ref,
        method: POSTOMAT_METHOD_PARAM,
        q: EMPTY_QUERY,
      },
    ]);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(WAREHOUSE_DELIVERY_KEYS);
    expect(delivery.mode).toBe(POSTOMAT_METHOD);
    expect(delivery.source).toBe(DIRECTORY_SOURCE);
    expect(delivery.city).toBe(KYIV_CITY_LINE);
    expect(delivery.warehouse).toBe(KYIV_POSTOMAT.label);
    expect(delivery.warehouse_number).toBe(KYIV_POSTOMAT.number);
  });

  test("ships np_courier with the directory city and the typed address, never touching the warehouse lookup", async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await stubSettlements(page, KYIV_SETTLEMENTS);

    await openUkCheckout(page);
    await fillUkContactFields(page);

    await pickCityOption(page, KYIV_SETTLEMENT, KYIV_QUERY);
    await methodChip(page, COURIER_METHOD).click();

    await expect(npWarehouseInput(page)).toHaveCount(GONE);

    await streetInput(page).fill(CHECKOUT_STREET);
    await buildingInput(page).fill(CHECKOUT_BUILDING);
    await apartmentInput(page).fill(CHECKOUT_APARTMENT);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(Object.keys(delivery).sort()).toEqual(COURIER_DELIVERY_KEYS);
    expect(delivery.mode).toBe(COURIER_METHOD);
    expect(delivery.source).toBe(DIRECTORY_SOURCE);
    expect(delivery.city).toBe(KYIV_CITY_LINE);
    expect(delivery.street).toBe(CHECKOUT_STREET);
    expect(delivery.building).toBe(CHECKOUT_BUILDING);
    expect(delivery.apartment).toBe(CHECKOUT_APARTMENT);
  });

  test("disables both warehouse chips with a visible reason and falls to the courier when the settlement carries no branches or lockers", async ({
    page,
  }) => {
    await stubSettlements(page, [WAREHOUSELESS_SETTLEMENT]);

    await openUkCheckout(page);
    await pickCityOption(page, WAREHOUSELESS_SETTLEMENT, VILLAGE_QUERY);

    await expect(methodChip(page, BRANCH_METHOD)).toHaveAttribute(
      ARIA_DISABLED,
      FLAG_SET
    );
    await expect(methodChip(page, POSTOMAT_METHOD)).toHaveAttribute(
      ARIA_DISABLED,
      FLAG_SET
    );
    await expect(
      page.getByText(UK_DICTIONARY.cart.np_no_warehouses)
    ).toBeVisible();

    await expect(methodChip(page, COURIER_METHOD)).toHaveAttribute(
      ARIA_CHECKED,
      FLAG_SET
    );
    await expect(npWarehouseInput(page)).toHaveCount(GONE);
    await expect(streetInput(page)).toBeVisible();
  });
});
