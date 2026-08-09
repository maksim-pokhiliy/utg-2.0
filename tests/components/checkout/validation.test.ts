import { describe, expect, it } from "vitest";

import { NP_METHODS, type NpMethod } from "@root/components/checkout/delivery";
import {
  INITIAL_FORM,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";
import { validateCheckout } from "@root/components/checkout/validation";
import type { Locale } from "@root/data";

const UK_LOCALE: Locale = "uk";
const EN_LOCALE: Locale = "en";

const BRANCH_METHOD: NpMethod = "np_branch";
const POSTOMAT_METHOD: NpMethod = "np_postomat";
const COURIER_METHOD: NpMethod = "np_courier";

const WAREHOUSE_METHODS: readonly NpMethod[] = [BRANCH_METHOD, POSTOMAT_METHOD];

const TYPED_UK_PHONE = "067 123 45 67";

const NORMALIZED_UK_PHONE = "+380671234567";

const TYPED_INTERNATIONAL_PHONE = "+1 202 555 0123";

const NORMALIZED_INTERNATIONAL_PHONE = "+12025550123";

const MALFORMED_PHONE = "@mariia";

const EMPTY_TEXT = "";

const LAST_NAME = "Шевченко";
const FIRST_NAME = "Марія";
const NP_CITY = "м. Львів, Львівська обл.";
const NP_WAREHOUSE = "Відділення №1: вул. Городоцька, 359";
const STREET = "вул. Городоцька";
const BUILDING = "359";
const APARTMENT = "12";
const COUNTRY = "Україна";
const STATE = "Львівська область";
const CITY = "Львів";
const ADDRESS = "Вулиця Казкового Міста 1";
const COMMENT = "після 18:00";
const PATRONYMIC = "Іванівна";

const ukForm = (
  overrides: Partial<CheckoutFormValues> = {}
): CheckoutFormValues => ({
  ...INITIAL_FORM,
  last_name: LAST_NAME,
  first_name: FIRST_NAME,
  telephone: TYPED_UK_PHONE,
  np_city: NP_CITY,
  np_warehouse: NP_WAREHOUSE,
  street: STREET,
  building: BUILDING,
  ...overrides,
});

const enForm = (
  overrides: Partial<CheckoutFormValues> = {}
): CheckoutFormValues => ({
  ...INITIAL_FORM,
  last_name: LAST_NAME,
  first_name: FIRST_NAME,
  telephone: TYPED_INTERNATIONAL_PHONE,
  country: COUNTRY,
  city: CITY,
  address: ADDRESS,
  ...overrides,
});

const reject = (
  values: CheckoutFormValues,
  locale: Locale,
  method: NpMethod
) => {
  const verdict = validateCheckout(values, locale, method);

  if (verdict.isValid) {
    throw new Error("The form validated where the test needed it rejected");
  }

  return verdict;
};

const accept = (
  values: CheckoutFormValues,
  locale: Locale,
  method: NpMethod
) => {
  const verdict = validateCheckout(values, locale, method);

  if (!verdict.isValid) {
    throw new Error("The form was rejected where the test needed it valid");
  }

  return verdict;
};

describe("validateCheckout on an untouched uk form", () => {
  it.each(WAREHOUSE_METHODS)(
    "reports the contact block plus the settlement and the warehouse as missing under %s",
    (method) => {
      expect(reject(INITIAL_FORM, UK_LOCALE, method).errors).toStrictEqual({
        last_name: "required",
        first_name: "required",
        telephone: "required",
        np_city: "required",
        np_warehouse: "required",
      });
    }
  );

  it("reports the contact block plus the settlement, the street and the building as missing under the courier", () => {
    expect(
      reject(INITIAL_FORM, UK_LOCALE, COURIER_METHOD).errors
    ).toStrictEqual({
      last_name: "required",
      first_name: "required",
      telephone: "required",
      np_city: "required",
      street: "required",
      building: "required",
    });
  });

  it("leaves the patronymic, the apartment and the comment out of the required set", () => {
    const { errors } = reject(INITIAL_FORM, UK_LOCALE, COURIER_METHOD);

    expect(errors.patronymic).toBeUndefined();
    expect(errors.apartment).toBeUndefined();
    expect(errors.comment).toBeUndefined();
  });

  it("never asks a Ukrainian buyer for the generic international address", () => {
    for (const method of NP_METHODS) {
      const { errors } = reject(INITIAL_FORM, UK_LOCALE, method);

      expect(errors.country, method).toBeUndefined();
      expect(errors.state, method).toBeUndefined();
      expect(errors.city, method).toBeUndefined();
      expect(errors.address, method).toBeUndefined();
    }
  });
});

describe("validateCheckout on an untouched en form", () => {
  it("reports the six generic fields as missing and nothing else", () => {
    expect(reject(INITIAL_FORM, EN_LOCALE, BRANCH_METHOD).errors).toStrictEqual(
      {
        last_name: "required",
        first_name: "required",
        telephone: "required",
        country: "required",
        city: "required",
        address: "required",
      }
    );
  });

  it("reaches that verdict whatever the delivery method says, because en never renders the Нова Пошта block", () => {
    for (const method of NP_METHODS) {
      expect(
        validateCheckout(INITIAL_FORM, EN_LOCALE, method),
        method
      ).toStrictEqual(validateCheckout(INITIAL_FORM, EN_LOCALE, BRANCH_METHOD));
    }
  });

  it("parts ways with the uk verdict, because requiredness became a locale rule when the Нова Пошта flow landed", () => {
    const en = reject(INITIAL_FORM, EN_LOCALE, BRANCH_METHOD);
    const uk = reject(INITIAL_FORM, UK_LOCALE, BRANCH_METHOD);

    expect(en.errors).not.toStrictEqual(uk.errors);
    expect(en.errors.np_city).toBeUndefined();
    expect(uk.errors.country).toBeUndefined();
  });
});

describe("what a uk warehouse order must carry", () => {
  it.each(WAREHOUSE_METHODS)(
    "accepts a %s order that names no street and no building at all",
    (method) => {
      const verdict = accept(
        ukForm({ street: EMPTY_TEXT, building: EMPTY_TEXT }),
        UK_LOCALE,
        method
      );

      expect(verdict.phone).toBe(NORMALIZED_UK_PHONE);
    }
  );

  it("rejects a warehouse order with no warehouse", () => {
    const verdict = reject(
      ukForm({ np_warehouse: EMPTY_TEXT }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.errors).toStrictEqual({ np_warehouse: "required" });
    expect(verdict.firstInvalid).toBe("np_warehouse");
  });

  it("rejects a warehouse order with no settlement, which is what the warehouse list hangs off", () => {
    expect(
      reject(ukForm({ np_city: EMPTY_TEXT }), UK_LOCALE, POSTOMAT_METHOD).errors
    ).toStrictEqual({ np_city: "required" });
  });
});

describe("what a uk courier order must carry", () => {
  it("accepts a courier order that names no warehouse at all", () => {
    const verdict = accept(
      ukForm({ np_warehouse: EMPTY_TEXT }),
      UK_LOCALE,
      COURIER_METHOD
    );

    expect(verdict.phone).toBe(NORMALIZED_UK_PHONE);
  });

  it("rejects a courier order with no street", () => {
    expect(
      reject(ukForm({ street: EMPTY_TEXT }), UK_LOCALE, COURIER_METHOD).errors
    ).toStrictEqual({ street: "required" });
  });

  it("rejects a courier order with no building", () => {
    expect(
      reject(ukForm({ building: EMPTY_TEXT }), UK_LOCALE, COURIER_METHOD).errors
    ).toStrictEqual({ building: "required" });
  });

  it("accepts a courier order to a private house, which has no apartment to give", () => {
    expect(
      accept(ukForm({ apartment: EMPTY_TEXT }), UK_LOCALE, COURIER_METHOD)
        .isValid
    ).toBe(true);
  });
});

describe("the field validateCheckout sends focus to", () => {
  it("names the surname before the given name, the order the ratified form renders", () => {
    const verdict = reject(
      ukForm({ last_name: EMPTY_TEXT, first_name: EMPTY_TEXT }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("prefers the contact block over the delivery block below it", () => {
    const verdict = reject(
      ukForm({ first_name: EMPTY_TEXT, np_city: EMPTY_TEXT }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.firstInvalid).toBe("first_name");
  });

  it("names the settlement before the warehouse that depends on it", () => {
    const verdict = reject(
      ukForm({ np_city: EMPTY_TEXT, np_warehouse: EMPTY_TEXT }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.errors).toStrictEqual({
      np_city: "required",
      np_warehouse: "required",
    });
    expect(verdict.firstInvalid).toBe("np_city");
  });

  it("names the settlement before the street, and the street before the building", () => {
    expect(
      reject(
        ukForm({ np_city: EMPTY_TEXT, street: EMPTY_TEXT }),
        UK_LOCALE,
        COURIER_METHOD
      ).firstInvalid
    ).toBe("np_city");
    expect(
      reject(
        ukForm({ street: EMPTY_TEXT, building: EMPTY_TEXT }),
        UK_LOCALE,
        COURIER_METHOD
      ).firstInvalid
    ).toBe("street");
  });

  it("walks the rendered order rather than the order the errors were found in", () => {
    const verdict = reject(
      ukForm({ last_name: EMPTY_TEXT, building: EMPTY_TEXT }),
      UK_LOCALE,
      COURIER_METHOD
    );

    expect(verdict.errors).toStrictEqual({
      last_name: "required",
      building: "required",
    });
    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("prefers a malformed phone over a missing settlement rendered below it, even though the phone verdict is reached last", () => {
    const verdict = reject(
      ukForm({ telephone: MALFORMED_PHONE, np_city: EMPTY_TEXT }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.errors).toStrictEqual({
      telephone: "phone_format",
      np_city: "required",
    });
    expect(verdict.firstInvalid).toBe("telephone");
  });

  it("prefers a missing surname over a malformed phone rendered below it", () => {
    const verdict = reject(
      ukForm({ last_name: EMPTY_TEXT, telephone: MALFORMED_PHONE }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.errors.telephone).toBe("phone_format");
    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("lands on the phone when it is the only field standing in the way", () => {
    expect(
      reject(ukForm({ telephone: MALFORMED_PHONE }), UK_LOCALE, BRANCH_METHOD)
        .firstInvalid
    ).toBe("telephone");
  });

  it("lands on the generic address of an en order, which renders below the Нова Пошта block it never shows", () => {
    expect(
      reject(enForm({ country: EMPTY_TEXT }), EN_LOCALE, COURIER_METHOD)
        .firstInvalid
    ).toBe("country");
  });
});

describe("the phone verdict", () => {
  it("reports a filled but malformed phone as a format error, not a missing one", () => {
    expect(
      reject(ukForm({ telephone: MALFORMED_PHONE }), UK_LOCALE, BRANCH_METHOD)
        .errors.telephone
    ).toBe("phone_format");
  });

  it("reports an empty phone as missing, not as malformed", () => {
    expect(
      reject(ukForm({ telephone: EMPTY_TEXT }), UK_LOCALE, BRANCH_METHOD).errors
        .telephone
    ).toBe("required");
  });

  it("hands back the normalized phone, so nothing downstream normalises twice", () => {
    expect(accept(ukForm(), UK_LOCALE, BRANCH_METHOD).phone).toBe(
      NORMALIZED_UK_PHONE
    );
  });

  it("applies the uk rule under the uk locale", () => {
    expect(
      accept(ukForm({ telephone: "0671234567" }), UK_LOCALE, BRANCH_METHOD)
        .phone
    ).toBe(NORMALIZED_UK_PHONE);
    expect(
      reject(
        ukForm({ telephone: TYPED_INTERNATIONAL_PHONE }),
        UK_LOCALE,
        BRANCH_METHOD
      ).errors.telephone
    ).toBe("phone_format");
  });

  it("applies the en rule under the en locale", () => {
    expect(accept(enForm(), EN_LOCALE, BRANCH_METHOD).phone).toBe(
      NORMALIZED_INTERNATIONAL_PHONE
    );
    expect(
      reject(enForm({ telephone: "0671234567" }), EN_LOCALE, BRANCH_METHOD)
        .errors.telephone
    ).toBe("phone_format");
  });

  it("reads the phone the same way whatever the delivery method is", () => {
    for (const method of NP_METHODS) {
      expect(
        reject(ukForm({ telephone: MALFORMED_PHONE }), UK_LOCALE, method).errors
          .telephone,
        method
      ).toBe("phone_format");
    }
  });
});

describe("the fields that never block submission", () => {
  it("never demands the apartment, in any locale and under any method", () => {
    for (const method of NP_METHODS) {
      expect(
        reject(INITIAL_FORM, UK_LOCALE, method).errors.apartment,
        method
      ).toBeUndefined();
      expect(
        reject(INITIAL_FORM, EN_LOCALE, method).errors.apartment,
        method
      ).toBeUndefined();
    }
  });

  it("submits a uk order without a patronymic, an apartment or a comment", () => {
    expect(
      accept(
        ukForm({
          patronymic: EMPTY_TEXT,
          apartment: EMPTY_TEXT,
          comment: EMPTY_TEXT,
        }),
        UK_LOCALE,
        COURIER_METHOD
      ).isValid
    ).toBe(true);
  });

  it("submits an en order without a region, which stopped being required when the checkout was rewritten", () => {
    const verdict = accept(
      enForm({ state: EMPTY_TEXT }),
      EN_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.isValid).toBe(true);
    expect(verdict.phone).toBe(NORMALIZED_INTERNATIONAL_PHONE);
  });

  it("keeps accepting the form once the optional fields are filled in", () => {
    expect(
      accept(
        ukForm({
          patronymic: PATRONYMIC,
          apartment: APARTMENT,
          comment: COMMENT,
        }),
        UK_LOCALE,
        COURIER_METHOD
      ).isValid
    ).toBe(true);
  });
});

describe("the reach of the locale and the method arguments", () => {
  it("accepts a uk order that leaves the whole generic address block blank", () => {
    const verdict = accept(
      ukForm({
        country: EMPTY_TEXT,
        state: EMPTY_TEXT,
        city: EMPTY_TEXT,
        address: EMPTY_TEXT,
      }),
      UK_LOCALE,
      BRANCH_METHOD
    );

    expect(verdict.isValid).toBe(true);
  });

  it("accepts an en order that leaves the whole Нова Пошта block blank", () => {
    const verdict = accept(
      enForm({
        np_city: EMPTY_TEXT,
        np_warehouse: EMPTY_TEXT,
        street: EMPTY_TEXT,
        building: EMPTY_TEXT,
      }),
      EN_LOCALE,
      COURIER_METHOD
    );

    expect(verdict.isValid).toBe(true);
  });

  it("accepts a Ukrainian address under en, because the two are not coupled", () => {
    const values = enForm({
      country: COUNTRY,
      state: STATE,
      city: CITY,
    });

    expect(accept(values, EN_LOCALE, BRANCH_METHOD).isValid).toBe(true);
  });

  it("changes only the delivery half of the verdict when the method flips", () => {
    const values = ukForm({ np_warehouse: EMPTY_TEXT, street: EMPTY_TEXT });

    expect(reject(values, UK_LOCALE, BRANCH_METHOD).errors).toStrictEqual({
      np_warehouse: "required",
    });
    expect(reject(values, UK_LOCALE, COURIER_METHOD).errors).toStrictEqual({
      street: "required",
    });
  });
});
