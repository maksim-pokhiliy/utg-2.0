import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  CHECKOUT_PATH,
  FORWARDED_FOR_HEADER,
  ORDER_ROUTE_GLOB,
  PRODUCT_PATH,
  SECOND_PRODUCT_PATH,
  SPEC_CLIENT_IPS,
  UK_DICTIONARY,
  UK_PRODUCT,
  UK_SECOND_PRODUCT,
  addToCartButton,
  cartButton,
  checkoutSummary,
  confirmCancelButton,
  confirmDialog,
  confirmRemoveButton,
  fillCheckoutForm,
  firstNameInput,
  orderToast,
  submitButton,
  summaryIncrementButton,
  summaryLine,
  summaryLineTotal,
  summaryQuantityInput,
  summaryRemoveButton,
  summaryTotal,
} from "./support/app";

test.use({
  extraHTTPHeaders: { [FORWARDED_FOR_HEADER]: SPEC_CLIENT_IPS.checkoutSummary },
});

const HELD_RELAY_STATUS = 503;

const JSON_CONTENT_TYPE = "application/json";

const RELAY_FAILURE_BODY = JSON.stringify({ error: "Order relay failed" });

const ARIA_DISABLED = "aria-disabled";

const LOCKED_VALUE = "true";

const FIRST_LINE_COUNT = 1;

const BOTH_LINES_COUNT = 2;

const STEPPED_CART_COUNT = 3;

const EMPTY_CART_COUNT = 0;

const SINGLE_QUANTITY = 1;

const STEPPED_QUANTITY = 2;

const GONE = 0;

const NON_DIGITS = /\D/g;

const DIGIT_GAP = "\\D*";

interface IGate {
  promise: Promise<void>;
  release: () => void;
}

const amountPattern = (uah: number): RegExp => {
  const digits = uah.toFixed(2).replace(NON_DIGITS, "").split("");

  return new RegExp(`^${DIGIT_GAP}${digits.join(DIGIT_GAP)}${DIGIT_GAP}$`);
};

const expectAmount = (locator: Locator, uah: number): Promise<void> =>
  expect(locator).toHaveText(amountPattern(uah));

const holdOpen = (): IGate => {
  let settle: () => void = () => undefined;

  const promise = new Promise<void>((resolve) => {
    settle = resolve;
  });

  return { promise, release: () => settle() };
};

const fillCart = async (page: Page): Promise<void> => {
  await page.goto(PRODUCT_PATH);
  await addToCartButton(page).click();
  await expect(cartButton(page, FIRST_LINE_COUNT)).toBeVisible();

  await page.goto(SECOND_PRODUCT_PATH);
  await addToCartButton(page).click();
  await expect(cartButton(page, BOTH_LINES_COUNT)).toBeVisible();

  await page.goto(CHECKOUT_PATH);
  await expect(checkoutSummary(page)).toBeVisible();
};

const removeLine = async (page: Page, title: string): Promise<void> => {
  await summaryRemoveButton(page, title).click();
  await expect(confirmDialog(page)).toBeVisible();

  await confirmRemoveButton(page).click();
  await expect(confirmDialog(page)).toHaveCount(GONE);
};

test.describe("the editable order summary", () => {
  test("carries a stepped quantity into the line total, the summary total and the header cart count", async ({
    page,
  }) => {
    await fillCart(page);

    await expectAmount(
      summaryLineTotal(page, UK_PRODUCT.title),
      UK_PRODUCT.price
    );
    await expectAmount(
      summaryLineTotal(page, UK_SECOND_PRODUCT.title),
      UK_SECOND_PRODUCT.price
    );
    await expectAmount(
      summaryTotal(page),
      UK_PRODUCT.price + UK_SECOND_PRODUCT.price
    );

    await summaryIncrementButton(page, UK_PRODUCT.title).click();

    await expect(summaryQuantityInput(page, UK_PRODUCT.title)).toHaveValue(
      String(STEPPED_QUANTITY)
    );
    await expectAmount(
      summaryLineTotal(page, UK_PRODUCT.title),
      UK_PRODUCT.price * STEPPED_QUANTITY
    );
    await expectAmount(
      summaryLineTotal(page, UK_SECOND_PRODUCT.title),
      UK_SECOND_PRODUCT.price
    );
    await expectAmount(
      summaryTotal(page),
      UK_PRODUCT.price * STEPPED_QUANTITY + UK_SECOND_PRODUCT.price
    );
    await expect(cartButton(page, STEPPED_CART_COUNT)).toBeVisible();
  });

  test("keeps the line when the remove dialog is cancelled and drops it when the dialog is confirmed", async ({
    page,
  }) => {
    await fillCart(page);

    await summaryRemoveButton(page, UK_PRODUCT.title).click();

    await expect(confirmDialog(page)).toContainText(
      UK_DICTIONARY.cart.remove_title
    );
    await expect(confirmDialog(page)).toContainText(UK_PRODUCT.title);

    await confirmCancelButton(page).click();

    await expect(confirmDialog(page)).toHaveCount(GONE);
    await expect(summaryLine(page, UK_PRODUCT.title)).toBeVisible();
    await expect(cartButton(page, BOTH_LINES_COUNT)).toBeVisible();

    await removeLine(page, UK_PRODUCT.title);

    await expect(summaryLine(page, UK_PRODUCT.title)).toHaveCount(GONE);
    await expect(summaryLine(page, UK_SECOND_PRODUCT.title)).toBeVisible();
    await expect(cartButton(page, FIRST_LINE_COUNT)).toBeVisible();
    await expectAmount(summaryTotal(page), UK_SECOND_PRODUCT.price);
  });

  test("lands on the empty-cart state and takes the form away when the last line is removed", async ({
    page,
  }) => {
    await fillCart(page);

    await removeLine(page, UK_PRODUCT.title);

    await expect(summaryLine(page, UK_SECOND_PRODUCT.title)).toBeVisible();
    await expect(firstNameInput(page)).toBeVisible();

    await removeLine(page, UK_SECOND_PRODUCT.title);

    await expect(page.getByText(UK_DICTIONARY.cart.empty_cart)).toBeVisible();
    await expect(checkoutSummary(page)).toHaveCount(GONE);
    await expect(firstNameInput(page)).toHaveCount(GONE);
    await expect(submitButton(page)).toHaveCount(GONE);
    await expect(cartButton(page, EMPTY_CART_COUNT)).toBeVisible();
  });

  test("locks the stepper and the remove control while the order is in flight and frees them once it settles", async ({
    page,
  }) => {
    const gate = holdOpen();

    await page.route(ORDER_ROUTE_GLOB, async (route) => {
      await gate.promise;

      await route.fulfill({
        status: HELD_RELAY_STATUS,
        contentType: JSON_CONTENT_TYPE,
        body: RELAY_FAILURE_BODY,
      });
    });

    await fillCart(page);

    await expect(firstNameInput(page)).toBeVisible();
    await fillCheckoutForm(page);
    await submitButton(page).click();

    const increment = summaryIncrementButton(page, UK_PRODUCT.title);
    const quantity = summaryQuantityInput(page, UK_PRODUCT.title);
    const remove = summaryRemoveButton(page, UK_PRODUCT.title);

    await expect(submitButton(page)).toBeDisabled();
    await expect(increment).toBeDisabled();
    await expect(quantity).toBeDisabled();
    await expect(remove).toHaveAttribute(ARIA_DISABLED, LOCKED_VALUE);

    await increment.dispatchEvent("click");
    await remove.dispatchEvent("click");

    await expect(quantity).toHaveValue(String(SINGLE_QUANTITY));
    await expect(confirmDialog(page)).toHaveCount(GONE);
    await expect(cartButton(page, BOTH_LINES_COUNT)).toBeVisible();
    await expectAmount(
      summaryTotal(page),
      UK_PRODUCT.price + UK_SECOND_PRODUCT.price
    );

    gate.release();

    await expect(orderToast(page)).toContainText(
      UK_DICTIONARY.cart.order_error
    );
    await expect(submitButton(page)).toBeEnabled();
    await expect(increment).toBeEnabled();
    await expect(quantity).toBeEnabled();
    await expect(remove).not.toHaveAttribute(ARIA_DISABLED, LOCKED_VALUE);

    await increment.click();

    await expect(quantity).toHaveValue(String(STEPPED_QUANTITY));
    await expect(cartButton(page, STEPPED_CART_COUNT)).toBeVisible();
  });
});
