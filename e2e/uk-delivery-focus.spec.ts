import { expect, test } from "@playwright/test";

import {
  CHECKOUT_MANUAL_CITY,
  FORWARDED_FOR_HEADER,
  KYIV_SETTLEMENTS,
  SPEC_CLIENT_IPS,
  fallbackHint,
  npCityInput,
  openUkCheckout,
  stubHeldSettlements,
  telephoneInput,
} from "./support/app";

test.use({
  extraHTTPHeaders: {
    [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.ukDeliveryFocus,
  },
});

const ROLE_ATTRIBUTE = "role";

const COMBOBOX_ROLE = "combobox";

test.describe("the caret when the delivery directory comes back", () => {
  test("hands the caret back to the buyer who clicked away and back while the answer was in flight", async ({
    page,
  }) => {
    await openUkCheckout(page);

    await npCityInput(page).fill(CHECKOUT_MANUAL_CITY);
    await fallbackHint(page).waitFor();

    await expect(npCityInput(page)).not.toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );

    const settlements = await stubHeldSettlements(page, KYIV_SETTLEMENTS);

    await telephoneInput(page).click();
    await settlements.waitForRequest();
    await npCityInput(page).click();

    await expect(npCityInput(page)).toBeFocused();

    settlements.release();

    await expect(npCityInput(page)).toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );
    await expect(npCityInput(page)).toBeFocused();
    await expect(npCityInput(page)).toHaveValue(CHECKOUT_MANUAL_CITY);
  });

  test("leaves the caret in the field the buyer moved on to instead of pulling it back", async ({
    page,
  }) => {
    await openUkCheckout(page);

    await npCityInput(page).fill(CHECKOUT_MANUAL_CITY);
    await fallbackHint(page).waitFor();

    const settlements = await stubHeldSettlements(page, KYIV_SETTLEMENTS);

    await telephoneInput(page).click();
    await settlements.waitForRequest();

    settlements.release();

    await expect(npCityInput(page)).toHaveAttribute(
      ROLE_ATTRIBUTE,
      COMBOBOX_ROLE
    );
    await expect(telephoneInput(page)).toBeFocused();
  });
});
