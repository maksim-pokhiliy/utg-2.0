import { expect, test } from "@playwright/test";

import {
  FORWARDED_FOR_HEADER,
  SETTLEMENTS_PATH,
  SPEC_CLIENT_IPS,
  WAREHOUSES_PATH,
} from "./support/app";

test.use({
  extraHTTPHeaders: { [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.npDirectory },
});

const BAD_REQUEST_STATUS = 400;

const UNAVAILABLE_STATUS = 503;

const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';

const INVALID_REQUEST_BODY = '{"error":"Invalid request"}';

const CARRIER_HOST = "novaposhta";

const SETTLEMENT_QUERY = `${SETTLEMENTS_PATH}?q=льв`;

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";

const WAREHOUSE_QUERY = `${WAREHOUSES_PATH}?city=${CITY_REF}&method=branch`;

const EMPTY_WAREHOUSE_QUERY = `${WAREHOUSE_QUERY}&q=`;

const INVALID_WAREHOUSE_QUERY = `${WAREHOUSES_PATH}?city=&method=nonsense`;

test.describe("delivery directory routes without a carrier key", () => {
  test("answers 503 for a settlement search", async ({ request }) => {
    const response = await request.get(SETTLEMENT_QUERY);
    const body = await response.text();

    expect(response.status()).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expect(body).not.toContain(CARRIER_HOST);
  });

  test("answers 503 for a warehouse lookup", async ({ request }) => {
    const response = await request.get(WAREHOUSE_QUERY);
    const body = await response.text();

    expect(response.status()).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expect(body).not.toContain(CARRIER_HOST);
  });

  test("answers 503 for the empty warehouse query the control opens with", async ({
    request,
  }) => {
    const response = await request.get(EMPTY_WAREHOUSE_QUERY);
    const body = await response.text();

    expect(response.status()).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expect(body).not.toContain(CARRIER_HOST);
  });

  test("answers 400 on the same path when the parameters are invalid", async ({
    request,
  }) => {
    const response = await request.get(INVALID_WAREHOUSE_QUERY);
    const body = await response.text();

    expect(response.status()).toBe(BAD_REQUEST_STATUS);
    expect(body).toBe(INVALID_REQUEST_BODY);
    expect(body).not.toContain(CARRIER_HOST);
  });
});
