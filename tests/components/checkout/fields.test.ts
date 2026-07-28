import { describe, expect, it } from "vitest";

import {
  AUTOFILL_TOKENS,
  INITIAL_FORM,
  REQUIRED_FIELDS,
  isRequiredField,
  trimFormValues,
  type CheckoutFieldName,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";

const OPTIONAL_FIELD: CheckoutFieldName = "additional";

const ALL_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "first_name",
  "last_name",
  "telephone",
  "country",
  "state",
  "city",
  "address",
  "additional",
];

const PADDED_FORM: CheckoutFormValues = {
  first_name: "  John  ",
  last_name: "\tWick\t",
  telephone: " 555-0100 ",
  country: "  Ukraine",
  state: "Lviv Oblast  ",
  city: "\n Lviv \n",
  address: "  1 Fairy Town Street  ",
  additional: "  leave it with the neighbour  ",
};

const TRIMMED_FORM: CheckoutFormValues = {
  first_name: "John",
  last_name: "Wick",
  telephone: "555-0100",
  country: "Ukraine",
  state: "Lviv Oblast",
  city: "Lviv",
  address: "1 Fairy Town Street",
  additional: "leave it with the neighbour",
};

describe("INITIAL_FORM", () => {
  it("defines every checkout field as an empty string", () => {
    expect(Object.keys(INITIAL_FORM).sort()).toEqual(
      [...ALL_FIELD_NAMES].sort()
    );
  });

  it("starts every field blank so validation sees a fresh form as missing", () => {
    expect(Object.values(INITIAL_FORM)).toEqual(ALL_FIELD_NAMES.map(() => ""));
  });
});

describe("REQUIRED_FIELDS", () => {
  it("declares exactly seven required fields", () => {
    expect(REQUIRED_FIELDS).toHaveLength(7);
  });

  it("names the fields the order bot renders in its message, in form order", () => {
    expect([...REQUIRED_FIELDS]).toEqual([
      "first_name",
      "last_name",
      "telephone",
      "country",
      "state",
      "city",
      "address",
    ]);
  });

  it("omits additional because it is the one optional field", () => {
    expect(REQUIRED_FIELDS).not.toContain(OPTIONAL_FIELD);
  });

  it("covers every INITIAL_FORM key once the optional field is added back", () => {
    expect([...REQUIRED_FIELDS, OPTIONAL_FIELD].sort()).toEqual(
      Object.keys(INITIAL_FORM).sort()
    );
  });

  it("declares no required field that INITIAL_FORM does not define", () => {
    const formKeys = Object.keys(INITIAL_FORM);

    for (const name of REQUIRED_FIELDS) {
      expect(formKeys, name).toContain(name);
    }
  });
});

describe("isRequiredField", () => {
  it("answers true for every field the order cannot go out without", () => {
    for (const name of REQUIRED_FIELDS) {
      expect(isRequiredField(name), name).toBe(true);
    }
  });

  it("answers false for the optional additional field", () => {
    expect(isRequiredField(OPTIONAL_FIELD)).toBe(false);
  });

  it("classifies every checkout field name", () => {
    for (const name of ALL_FIELD_NAMES) {
      expect(isRequiredField(name), name).toBe(name !== OPTIONAL_FIELD);
    }
  });
});

describe("AUTOFILL_TOKENS", () => {
  it("maps every checkout field name, so a new field cannot skip the decision", () => {
    expect(Object.keys(AUTOFILL_TOKENS).sort()).toEqual(
      [...ALL_FIELD_NAMES].sort()
    );
  });

  it("gives each autofillable field its HTML autofill token", () => {
    expect(AUTOFILL_TOKENS).toStrictEqual({
      first_name: "given-name",
      last_name: "family-name",
      telephone: undefined,
      country: "country-name",
      state: "address-level1",
      city: "address-level2",
      address: "street-address",
      additional: undefined,
    });
  });

  it("deliberately leaves telephone tokenless because it also accepts a Telegram handle", () => {
    expect(AUTOFILL_TOKENS.telephone).toBeUndefined();
  });

  it("leaves the free-form additional field tokenless", () => {
    expect(AUTOFILL_TOKENS.additional).toBeUndefined();
  });
});

describe("trimFormValues", () => {
  it("trims leading and trailing whitespace from all eight fields", () => {
    expect(trimFormValues(PADDED_FORM)).toStrictEqual(TRIMMED_FORM);
  });

  it("returns exactly the INITIAL_FORM key set", () => {
    expect(Object.keys(trimFormValues(PADDED_FORM)).sort()).toEqual(
      Object.keys(INITIAL_FORM).sort()
    );
  });

  it("collapses a whitespace-only required value to the empty string validation rejects", () => {
    const trimmed = trimFormValues({ ...INITIAL_FORM, first_name: "   " });

    expect(trimmed.first_name).toBe("");
  });

  it("leaves an already trimmed form untouched", () => {
    expect(trimFormValues(TRIMMED_FORM)).toStrictEqual(TRIMMED_FORM);
  });
});
