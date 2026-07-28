import { describe, expect, it } from "vitest";

import type { Currency, IMoney } from "@root/utils/formatPrice";
import {
  currencyMap,
  formatPrice,
  resolveMoney,
} from "@root/utils/formatPrice";

const USD_RATE = 0.024;

const UAH_MONEY: IMoney = { coefficient: 1, currency: "UAH" };

const USD_MONEY: IMoney = { coefficient: USD_RATE, currency: "USD" };

const PRICE = 1300;

const HRYVNIA_SIGN = "₴";

const DOLLAR_SIGN = "$";

const intlFormat = (
  amount: number,
  currency: Currency,
  locale: string
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);

describe("currencyMap", () => {
  it("covers exactly the two supported locales", () => {
    expect(Object.keys(currencyMap)).toEqual(["uk", "en"]);
  });

  it("denominates uk in hryvnia and en in dollars", () => {
    expect(currencyMap).toEqual({ uk: "UAH", en: "USD" });
  });
});

describe("resolveMoney", () => {
  it("falls back to unconverted hryvnia for uk when the rate table is empty", () => {
    expect(resolveMoney("uk", {})).toEqual(UAH_MONEY);
  });

  it("keeps hryvnia for uk when the table publishes both rates", () => {
    expect(resolveMoney("uk", { UAH: 1, USD: USD_RATE })).toEqual(UAH_MONEY);
  });

  it("falls back to unconverted hryvnia for uk when only a dollar rate is published", () => {
    expect(resolveMoney("uk", { USD: USD_RATE })).toEqual(UAH_MONEY);
  });

  it("takes the hryvnia coefficient from the table instead of assuming one", () => {
    expect(resolveMoney("uk", { UAH: 2 })).toEqual({
      coefficient: 2,
      currency: "UAH",
    });
  });

  it("shows real hryvnia amounts for en when no rates are available", () => {
    expect(resolveMoney("en", {})).toEqual(UAH_MONEY);
  });

  it("converts to dollars for en when a dollar rate is published", () => {
    expect(resolveMoney("en", { USD: USD_RATE })).toEqual(USD_MONEY);
  });

  it("rejects a zero dollar rate and stays in hryvnia", () => {
    expect(resolveMoney("en", { USD: 0 })).toEqual(UAH_MONEY);
  });

  it("rejects a negative dollar rate and stays in hryvnia", () => {
    expect(resolveMoney("en", { USD: -1 })).toEqual(UAH_MONEY);
  });

  it("rejects a non-finite dollar rate and stays in hryvnia", () => {
    expect(resolveMoney("en", { USD: Number.NaN })).toEqual(UAH_MONEY);
  });
});

describe("formatPrice", () => {
  it("formats an unconverted hryvnia amount for uk", () => {
    expect(formatPrice(PRICE, UAH_MONEY, "uk")).toBe(
      intlFormat(PRICE, "UAH", "uk")
    );
  });

  it("formats an unconverted hryvnia amount for en", () => {
    expect(formatPrice(PRICE, UAH_MONEY, "en")).toBe(
      intlFormat(PRICE, "UAH", "en")
    );
  });

  it("multiplies the hryvnia price by the coefficient before formatting", () => {
    expect(formatPrice(PRICE, USD_MONEY, "en")).toBe(
      intlFormat(PRICE * USD_RATE, "USD", "en")
    );
  });

  it("marks a converted amount with a dollar sign", () => {
    expect(formatPrice(PRICE, USD_MONEY, "en")).toContain(DOLLAR_SIGN);
  });
});

describe("resolveMoney feeding formatPrice", () => {
  it("never puts a dollar sign on a hryvnia magnitude for uk", () => {
    const formatted = formatPrice(PRICE, resolveMoney("uk", {}), "uk");

    expect(formatted).toContain(HRYVNIA_SIGN);
    expect(formatted).not.toContain(DOLLAR_SIGN);
  });

  it("never puts a dollar sign on a hryvnia magnitude for en when rates are unavailable", () => {
    const formatted = formatPrice(PRICE, resolveMoney("en", {}), "en");

    expect(formatted).toContain(HRYVNIA_SIGN);
    expect(formatted).not.toContain(DOLLAR_SIGN);
  });

  it("switches en to a dollar magnitude once a rate is published", () => {
    const money = resolveMoney("en", { USD: USD_RATE });
    const formatted = formatPrice(PRICE, money, "en");

    expect(formatted).toContain(DOLLAR_SIGN);
    expect(formatted).not.toContain(HRYVNIA_SIGN);
  });
});
