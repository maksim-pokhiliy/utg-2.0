import { describe, expect, it } from "vitest";

import {
  INITIAL_FORM,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";
import { validateCheckout } from "@root/components/checkout/validation";
import type { Locale } from "@root/data";

const TYPED_UK_PHONE = "067 123 45 67";

const NORMALIZED_UK_PHONE = "+380671234567";

const TYPED_INTERNATIONAL_PHONE = "+1 202 555 0123";

const NORMALIZED_INTERNATIONAL_PHONE = "+12025550123";

const MALFORMED_PHONE = "@mariia";

const filledForm = (
  overrides: Partial<CheckoutFormValues> = {}
): CheckoutFormValues => ({
  ...INITIAL_FORM,
  last_name: "Шевченко",
  first_name: "Марія",
  telephone: TYPED_UK_PHONE,
  country: "Україна",
  city: "Львів",
  address: "Вулиця Казкового Міста 1",
  ...overrides,
});

const reject = (values: CheckoutFormValues, locale: Locale) => {
  const verdict = validateCheckout(values, locale);

  if (verdict.isValid) {
    throw new Error("The form validated where the test needed it rejected");
  }

  return verdict;
};

const accept = (values: CheckoutFormValues, locale: Locale) => {
  const verdict = validateCheckout(values, locale);

  if (!verdict.isValid) {
    throw new Error("The form was rejected where the test needed it valid");
  }

  return verdict;
};

describe("validateCheckout on an untouched form", () => {
  it("reports every required field as missing and nothing else", () => {
    expect(reject(INITIAL_FORM, "uk").errors).toStrictEqual({
      last_name: "required",
      first_name: "required",
      telephone: "required",
      country: "required",
      city: "required",
      address: "required",
    });
  });

  it("leaves the patronymic, the region and the comment out of the required set", () => {
    const { errors } = reject(INITIAL_FORM, "uk");

    expect(errors.patronymic).toBeUndefined();
    expect(errors.state).toBeUndefined();
    expect(errors.comment).toBeUndefined();
  });

  it("reaches the same verdict under en, because requiredness is not a locale rule", () => {
    expect(validateCheckout(INITIAL_FORM, "en")).toStrictEqual(
      validateCheckout(INITIAL_FORM, "uk")
    );
  });
});

describe("the field validateCheckout sends focus to", () => {
  it("names the surname before the given name, the order the ratified form renders", () => {
    const verdict = reject(filledForm({ last_name: "", first_name: "" }), "uk");

    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("moves on to the given name once the surname is filled", () => {
    expect(reject(filledForm({ first_name: "" }), "uk").firstInvalid).toBe(
      "first_name"
    );
  });

  it("walks the rendered order rather than the order the errors were found in", () => {
    const verdict = reject(filledForm({ last_name: "", address: "" }), "uk");

    expect(verdict.errors).toStrictEqual({
      last_name: "required",
      address: "required",
    });
    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("prefers a missing surname over a malformed phone rendered below it", () => {
    const verdict = reject(
      filledForm({ last_name: "", telephone: MALFORMED_PHONE }),
      "uk"
    );

    expect(verdict.errors.telephone).toBe("phone_format");
    expect(verdict.firstInvalid).toBe("last_name");
  });

  it("lands on the phone when it is the only field standing in the way", () => {
    expect(
      reject(filledForm({ telephone: MALFORMED_PHONE }), "uk").firstInvalid
    ).toBe("telephone");
  });
});

describe("the phone verdict", () => {
  it("reports a filled but malformed phone as a format error, not a missing one", () => {
    expect(
      reject(filledForm({ telephone: MALFORMED_PHONE }), "uk").errors.telephone
    ).toBe("phone_format");
  });

  it("reports an empty phone as missing, not as malformed", () => {
    expect(reject(filledForm({ telephone: "" }), "uk").errors.telephone).toBe(
      "required"
    );
  });

  it("hands back the normalized phone, so nothing downstream normalises twice", () => {
    expect(accept(filledForm(), "uk").phone).toBe(NORMALIZED_UK_PHONE);
  });

  it("applies the uk rule under the uk locale", () => {
    expect(accept(filledForm({ telephone: "0671234567" }), "uk").phone).toBe(
      NORMALIZED_UK_PHONE
    );
    expect(
      reject(filledForm({ telephone: TYPED_INTERNATIONAL_PHONE }), "uk").errors
        .telephone
    ).toBe("phone_format");
  });

  it("applies the en rule under the en locale", () => {
    expect(
      accept(filledForm({ telephone: TYPED_INTERNATIONAL_PHONE }), "en").phone
    ).toBe(NORMALIZED_INTERNATIONAL_PHONE);
    expect(
      reject(filledForm({ telephone: "0671234567" }), "en").errors.telephone
    ).toBe("phone_format");
  });
});

describe("the fields that never block submission", () => {
  it("submits without a region, which stopped being required when the checkout was rewritten", () => {
    const verdict = accept(filledForm({ state: "" }), "uk");

    expect(verdict.isValid).toBe(true);
    expect(verdict.phone).toBe(NORMALIZED_UK_PHONE);
  });

  it("submits without a patronymic and without a comment", () => {
    expect(
      accept(filledForm({ patronymic: "", comment: "" }), "uk").isValid
    ).toBe(true);
  });

  it("keeps accepting the form once the optional fields are filled in", () => {
    const verdict = accept(
      filledForm({
        patronymic: "Іванівна",
        state: "Львівська область",
        comment: "після 18:00",
      }),
      "uk"
    );

    expect(verdict.isValid).toBe(true);
  });
});

describe("the reach of the locale argument", () => {
  it("never inspects the delivery fields against the locale", () => {
    const values = filledForm({ telephone: NORMALIZED_UK_PHONE });

    expect(validateCheckout(values, "en")).toStrictEqual(
      validateCheckout(values, "uk")
    );
  });

  it("accepts a Ukrainian address under en, because the two are not coupled", () => {
    const values = filledForm({
      telephone: TYPED_INTERNATIONAL_PHONE,
      country: "Україна",
      state: "Львівська область",
      city: "Львів",
    });

    expect(accept(values, "en").isValid).toBe(true);
  });

  it("changes only the phone verdict when the locale flips", () => {
    const values = filledForm({ telephone: "0671234567" });

    expect(accept(values, "uk").phone).toBe(NORMALIZED_UK_PHONE);
    expect(reject(values, "en").errors).toStrictEqual({
      telephone: "phone_format",
    });
  });
});
