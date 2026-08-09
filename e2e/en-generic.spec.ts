import { expect, test } from "@playwright/test";

import {
  EN_DICTIONARY,
  FORWARDED_FOR_HEADER,
  SPEC_CLIENT_IPS,
  captureOrders,
  fillEnCheckoutForm,
  openEnCheckout,
  readOrderSection,
  submitCapturedOrder,
} from "./support/app";

test.use({
  extraHTTPHeaders: { [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.enGeneric },
});

const DELIVERY_KEY = "delivery";

const EN_LOCALE = "en";

const GENERIC_DELIVERY_MODE = "generic";

const GENERIC_DELIVERY_KEYS = ["address", "city", "country", "mode", "state"];

test.describe("the en generic delivery path", () => {
  test('sends delivery.mode "generic" under locale "en" with no delivery.source and the international address set', async ({
    page,
  }) => {
    const bodies = await captureOrders(page);

    await openEnCheckout(page);
    await fillEnCheckoutForm(page);

    const body = await submitCapturedOrder(page, bodies);
    const delivery = readOrderSection(body, DELIVERY_KEY);

    expect(body.locale).toBe(EN_LOCALE);
    expect(delivery.mode).toBe(GENERIC_DELIVERY_MODE);
    expect(delivery.source).toBeUndefined();
    expect(Object.keys(delivery).sort()).toEqual(GENERIC_DELIVERY_KEYS);
    expect(delivery.country).toBe(EN_DICTIONARY.cart.country_placeholder);
    expect(delivery.state).toBe(EN_DICTIONARY.cart.state_placeholder);
    expect(delivery.city).toBe(EN_DICTIONARY.cart.city_placeholder);
    expect(delivery.address).toBe(EN_DICTIONARY.cart.address_placeholder);
  });
});
