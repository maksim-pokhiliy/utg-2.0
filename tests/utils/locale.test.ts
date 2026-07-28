import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, LOCALES, resolveLocale } from "@root/utils/locale";

describe("resolveLocale", () => {
  it("resolves the en locale from its own segment", () => {
    expect(resolveLocale("en")).toBe("en");
  });

  it("resolves the uk locale from its own segment", () => {
    expect(resolveLocale("uk")).toBe("uk");
  });

  it("falls back to the default locale for an unsupported language", () => {
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE);
  });

  it("falls back to the default locale for an empty segment", () => {
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
  });
});

describe("LOCALES", () => {
  it("lists every supported locale", () => {
    expect(LOCALES).toHaveLength(2);
  });

  it("keeps uk first because the order is the locale-matcher preference order", () => {
    expect([...LOCALES]).toEqual(["uk", "en"]);
  });

  it("contains the default locale", () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});
