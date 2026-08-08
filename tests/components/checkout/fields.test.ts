import { describe, expect, it } from "vitest";

import ukDictionary from "@root/app/[lang]/dictionaries/uk.json";
import {
  AUTOFILL_TOKENS,
  CHANNEL_LABEL_KEYS,
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CHANNEL,
  FIELD_ORDER,
  INITIAL_FORM,
  REQUIRED_FIELDS,
  isContactChannel,
  isRequiredField,
  trimFormValues,
  type CheckoutFieldName,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";

const RENDERED_ORDER: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "patronymic",
  "telephone",
  "country",
  "state",
  "city",
  "address",
  "comment",
];

const REQUIRED_IN_RENDERED_ORDER: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "country",
  "city",
  "address",
];

const OPTIONAL_FIELDS: readonly CheckoutFieldName[] = [
  "patronymic",
  "state",
  "comment",
];

const NON_CHANNEL_VALUES: readonly string[] = [
  "",
  " ",
  "Call",
  "CALL",
  "TELEGRAM",
  "whatsapp",
  "signal",
  "call ",
];

const PADDED_FORM: CheckoutFormValues = {
  last_name: "\tШевченко\t",
  first_name: "  Марія  ",
  patronymic: "  Іванівна ",
  telephone: " 067 123 45 67 ",
  country: "  Україна",
  state: "Львівська область  ",
  city: "\n Львів \n",
  address: "  Вулиця Казкового Міста 1  ",
  comment: "  залиште у сусідів  ",
};

const TRIMMED_FORM: CheckoutFormValues = {
  last_name: "Шевченко",
  first_name: "Марія",
  patronymic: "Іванівна",
  telephone: "067 123 45 67",
  country: "Україна",
  state: "Львівська область",
  city: "Львів",
  address: "Вулиця Казкового Міста 1",
  comment: "залиште у сусідів",
};

describe("INITIAL_FORM", () => {
  it("defines every checkout field as an empty string", () => {
    expect(Object.keys(INITIAL_FORM).sort()).toEqual(
      [...RENDERED_ORDER].sort()
    );
  });

  it("starts every field blank so validation sees a fresh form as missing", () => {
    expect(Object.values(INITIAL_FORM)).toEqual(RENDERED_ORDER.map(() => ""));
  });
});

describe("FIELD_ORDER", () => {
  it("lists the fields in the order the ratified checkout renders them", () => {
    expect([...FIELD_ORDER]).toEqual([...RENDERED_ORDER]);
  });

  it("puts the surname above the given name, the convention Ukrainian forms use", () => {
    expect(FIELD_ORDER.indexOf("last_name")).toBeLessThan(
      FIELD_ORDER.indexOf("first_name")
    );
  });

  it("covers every INITIAL_FORM key exactly once, so a new field cannot skip the ordering decision", () => {
    expect([...FIELD_ORDER].sort()).toEqual(Object.keys(INITIAL_FORM).sort());
  });
});

describe("REQUIRED_FIELDS", () => {
  it("declares exactly six required text fields", () => {
    expect(REQUIRED_FIELDS).toHaveLength(6);
  });

  it("names the fields an order cannot go out without, in rendered order", () => {
    expect([...REQUIRED_FIELDS]).toEqual([...REQUIRED_IN_RENDERED_ORDER]);
  });

  it("stops demanding the region, which the rewritten checkout made optional", () => {
    expect(REQUIRED_FIELDS).not.toContain("state");
  });

  it("leaves the patronymic and the comment optional too", () => {
    expect(REQUIRED_FIELDS).not.toContain("patronymic");
    expect(REQUIRED_FIELDS).not.toContain("comment");
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

  it("answers false for every field the buyer may leave blank", () => {
    for (const name of OPTIONAL_FIELDS) {
      expect(isRequiredField(name), name).toBe(false);
    }
  });

  it("classifies every checkout field name", () => {
    for (const name of RENDERED_ORDER) {
      expect(isRequiredField(name), name).toBe(
        REQUIRED_IN_RENDERED_ORDER.includes(name)
      );
    }
  });
});

describe("CONTACT_CHANNELS", () => {
  it("pins the call, telegram and viber wire values in lowercase", () => {
    expect([...CONTACT_CHANNELS]).toEqual(["call", "telegram", "viber"]);
  });

  it("preselects the call channel because a phone is required anyway", () => {
    expect(DEFAULT_CONTACT_CHANNEL).toBe("call");
    expect([...CONTACT_CHANNELS]).toContain(DEFAULT_CONTACT_CHANNEL);
  });
});

describe("isContactChannel", () => {
  it("accepts every wire value the chips offer", () => {
    for (const channel of CONTACT_CHANNELS) {
      expect(isContactChannel(channel), channel).toBe(true);
    }
  });

  it("refuses anything the chips never offer, casing included", () => {
    for (const value of NON_CHANNEL_VALUES) {
      expect(isContactChannel(value), value).toBe(false);
    }
  });
});

describe("CHANNEL_LABEL_KEYS", () => {
  it("maps every contact channel, so a new chip cannot ship without a label", () => {
    expect(Object.keys(CHANNEL_LABEL_KEYS).sort()).toEqual(
      [...CONTACT_CHANNELS].sort()
    );
  });

  it("points every channel at a dictionary key that resolves to real copy", () => {
    for (const channel of CONTACT_CHANNELS) {
      const label = ukDictionary.cart[CHANNEL_LABEL_KEYS[channel]];

      expect(label, channel).toBeTypeOf("string");
      expect(label, channel).not.toBe("");
    }
  });
});

describe("AUTOFILL_TOKENS", () => {
  it("maps every checkout field name, so a new field cannot skip the decision", () => {
    expect(Object.keys(AUTOFILL_TOKENS).sort()).toEqual(
      [...RENDERED_ORDER].sort()
    );
  });

  it("gives each autofillable field its HTML autofill token", () => {
    expect(AUTOFILL_TOKENS).toStrictEqual({
      last_name: "family-name",
      first_name: "given-name",
      patronymic: "additional-name",
      telephone: "tel",
      country: "country-name",
      state: "address-level1",
      city: "address-level2",
      address: "street-address",
      comment: undefined,
    });
  });

  it("tokenises the phone now that the field carries a phone number and nothing else", () => {
    expect(AUTOFILL_TOKENS.telephone).toBe("tel");
  });

  it("leaves the free-form comment tokenless", () => {
    expect(AUTOFILL_TOKENS.comment).toBeUndefined();
  });
});

describe("trimFormValues", () => {
  it("trims leading and trailing whitespace from all nine fields", () => {
    expect(trimFormValues(PADDED_FORM)).toStrictEqual(TRIMMED_FORM);
  });

  it("returns exactly the INITIAL_FORM key set", () => {
    expect(Object.keys(trimFormValues(PADDED_FORM)).sort()).toEqual(
      Object.keys(INITIAL_FORM).sort()
    );
  });

  it("collapses a whitespace-only required value to the empty string validation rejects", () => {
    expect(
      trimFormValues({ ...INITIAL_FORM, first_name: "   " }).first_name
    ).toBe("");
  });

  it("collapses a whitespace-only optional value to the empty string the payload omits", () => {
    const trimmed = trimFormValues({
      ...INITIAL_FORM,
      patronymic: "  ",
      state: "\t",
      comment: "\n ",
    });

    expect(trimmed.patronymic).toBe("");
    expect(trimmed.state).toBe("");
    expect(trimmed.comment).toBe("");
  });

  it("leaves an already trimmed form untouched", () => {
    expect(trimFormValues(TRIMMED_FORM)).toStrictEqual(TRIMMED_FORM);
  });
});
