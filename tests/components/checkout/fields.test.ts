import { describe, expect, it } from "vitest";

import ukDictionary from "@root/app/[lang]/dictionaries/uk.json";
import { NP_METHODS, type NpMethod } from "@root/components/checkout/delivery";
import {
  AUTOFILL_TOKENS,
  CHANNEL_LABEL_KEYS,
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CHANNEL,
  FIELD_ORDER,
  INITIAL_FORM,
  isContactChannel,
  requiredFieldsFor,
  trimFormValues,
  type CheckoutFieldName,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";
import type { Locale } from "@root/data";

const UK_LOCALE: Locale = "uk";
const EN_LOCALE: Locale = "en";

const BRANCH_METHOD: NpMethod = "np_branch";
const POSTOMAT_METHOD: NpMethod = "np_postomat";
const COURIER_METHOD: NpMethod = "np_courier";

const WAREHOUSE_METHODS: readonly NpMethod[] = [BRANCH_METHOD, POSTOMAT_METHOD];

const FIELD_COUNT = 14;

const RENDERED_ORDER: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "patronymic",
  "telephone",
  "np_city",
  "np_warehouse",
  "street",
  "building",
  "apartment",
  "country",
  "state",
  "city",
  "address",
  "comment",
];

const UK_WAREHOUSE_REQUIRED: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "np_city",
  "np_warehouse",
];

const UK_COURIER_REQUIRED: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "np_city",
  "street",
  "building",
];

const EN_REQUIRED: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "country",
  "city",
  "address",
];

const ALWAYS_OPTIONAL_FIELDS: readonly CheckoutFieldName[] = [
  "patronymic",
  "apartment",
  "state",
  "comment",
];

const GENERIC_ADDRESS_FIELDS: readonly CheckoutFieldName[] = [
  "country",
  "state",
  "city",
  "address",
];

const NP_ADDRESS_FIELDS: readonly CheckoutFieldName[] = [
  "np_city",
  "np_warehouse",
  "street",
  "building",
  "apartment",
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
  np_city: "  м. Львів, Львівська обл. ",
  np_warehouse: "\tВідділення №1: вул. Городоцька, 359 ",
  street: "  вул. Городоцька ",
  building: " 359\t",
  apartment: "\n12 ",
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
  np_city: "м. Львів, Львівська обл.",
  np_warehouse: "Відділення №1: вул. Городоцька, 359",
  street: "вул. Городоцька",
  building: "359",
  apartment: "12",
  comment: "залиште у сусідів",
};

const requiredNames = (
  locale: Locale,
  method: NpMethod
): readonly CheckoutFieldName[] => [...requiredFieldsFor(locale, method)];

describe("INITIAL_FORM", () => {
  it("defines every checkout field the three delivery modes between them render", () => {
    expect(Object.keys(INITIAL_FORM).sort()).toEqual(
      [...RENDERED_ORDER].sort()
    );
  });

  it("holds all fourteen fields, the uk Нова Пошта set included", () => {
    expect(Object.keys(INITIAL_FORM)).toHaveLength(FIELD_COUNT);
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

  it("renders the Нова Пошта block between the contact block and the generic address block", () => {
    expect(FIELD_ORDER.indexOf("telephone")).toBeLessThan(
      FIELD_ORDER.indexOf("np_city")
    );
    expect(FIELD_ORDER.indexOf("apartment")).toBeLessThan(
      FIELD_ORDER.indexOf("country")
    );
  });

  it("asks for the settlement before the warehouse, which cannot be searched without it", () => {
    expect(FIELD_ORDER.indexOf("np_city")).toBeLessThan(
      FIELD_ORDER.indexOf("np_warehouse")
    );
  });

  it("covers every INITIAL_FORM key exactly once, so a new field cannot skip the ordering decision", () => {
    expect([...FIELD_ORDER].sort()).toEqual(Object.keys(INITIAL_FORM).sort());
    expect(new Set(FIELD_ORDER).size).toBe(FIELD_ORDER.length);
  });
});

describe("requiredFieldsFor under the en locale", () => {
  it("asks for the six generic fields §3 names and nothing else", () => {
    expect(requiredNames(EN_LOCALE, BRANCH_METHOD)).toEqual([...EN_REQUIRED]);
  });

  it("reaches the same six whatever the delivery method says, because en never renders the Нова Пошта block", () => {
    for (const method of NP_METHODS) {
      expect(requiredNames(EN_LOCALE, method), method).toEqual([
        ...EN_REQUIRED,
      ]);
    }
  });

  it("never asks an international buyer for a Нова Пошта field", () => {
    for (const name of NP_ADDRESS_FIELDS) {
      expect(requiredNames(EN_LOCALE, COURIER_METHOD), name).not.toContain(
        name
      );
    }
  });

  it("stops demanding the region, which the rewritten checkout made optional", () => {
    expect(requiredNames(EN_LOCALE, BRANCH_METHOD)).not.toContain("state");
  });
});

describe("requiredFieldsFor under the uk locale", () => {
  it("asks a warehouse method for the contact block plus the settlement and the warehouse", () => {
    for (const method of WAREHOUSE_METHODS) {
      expect(requiredNames(UK_LOCALE, method), method).toEqual([
        ...UK_WAREHOUSE_REQUIRED,
      ]);
    }
  });

  it("asks the courier for the contact block plus the settlement, the street and the building", () => {
    expect(requiredNames(UK_LOCALE, COURIER_METHOD)).toEqual([
      ...UK_COURIER_REQUIRED,
    ]);
  });

  it("never asks a Ukrainian buyer for the generic international address", () => {
    for (const method of NP_METHODS) {
      for (const name of GENERIC_ADDRESS_FIELDS) {
        expect(requiredNames(UK_LOCALE, method), name).not.toContain(name);
      }
    }
  });

  it("swaps the warehouse for the street and the building when the method flips to the courier", () => {
    const warehouse = requiredNames(UK_LOCALE, BRANCH_METHOD);
    const courier = requiredNames(UK_LOCALE, COURIER_METHOD);

    expect(warehouse).toContain("np_warehouse");
    expect(warehouse).not.toContain("street");
    expect(courier).not.toContain("np_warehouse");
    expect(courier).toContain("street");
    expect(courier).toContain("building");
  });
});

describe("what requiredFieldsFor never demands", () => {
  it("leaves the patronymic, the apartment, the region and the comment optional in every mode", () => {
    for (const locale of [UK_LOCALE, EN_LOCALE]) {
      for (const method of NP_METHODS) {
        for (const name of ALWAYS_OPTIONAL_FIELDS) {
          expect(requiredNames(locale, method), name).not.toContain(name);
        }
      }
    }
  });

  it("declares no required field that INITIAL_FORM does not define", () => {
    const formKeys = Object.keys(INITIAL_FORM);

    for (const locale of [UK_LOCALE, EN_LOCALE]) {
      for (const method of NP_METHODS) {
        for (const name of requiredFieldsFor(locale, method)) {
          expect(formKeys, name).toContain(name);
        }
      }
    }
  });

  it("names each required field once and in rendered order, so focus walks down the form", () => {
    for (const locale of [UK_LOCALE, EN_LOCALE]) {
      for (const method of NP_METHODS) {
        const names = requiredNames(locale, method);
        const positions = names.map((name) => FIELD_ORDER.indexOf(name));

        expect(new Set(names).size, method).toBe(names.length);
        expect(positions, method).toEqual([...positions].sort((a, b) => a - b));
      }
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
      np_city: "address-level2",
      np_warehouse: undefined,
      street: "address-line1",
      building: undefined,
      apartment: "address-line2",
      comment: undefined,
    });
  });

  it("lets the browser fill the Нова Пошта settlement as a locality, the same token the generic city uses", () => {
    expect(AUTOFILL_TOKENS.np_city).toBe(AUTOFILL_TOKENS.city);
  });

  it("leaves the warehouse, the building and the comment tokenless, because no autofill vocabulary describes them", () => {
    expect(AUTOFILL_TOKENS.np_warehouse).toBeUndefined();
    expect(AUTOFILL_TOKENS.building).toBeUndefined();
    expect(AUTOFILL_TOKENS.comment).toBeUndefined();
  });
});

describe("trimFormValues", () => {
  it("trims leading and trailing whitespace from all fourteen fields", () => {
    expect(trimFormValues(PADDED_FORM)).toStrictEqual(TRIMMED_FORM);
  });

  it("returns exactly the INITIAL_FORM key set", () => {
    expect(Object.keys(trimFormValues(PADDED_FORM)).sort()).toEqual(
      Object.keys(INITIAL_FORM).sort()
    );
  });

  it("collapses a whitespace-only required value to the empty string validation rejects", () => {
    const trimmed = trimFormValues({
      ...INITIAL_FORM,
      first_name: "   ",
      np_city: "  ",
      np_warehouse: "\t",
      street: " ",
      building: "\n",
    });

    expect(trimmed.first_name).toBe("");
    expect(trimmed.np_city).toBe("");
    expect(trimmed.np_warehouse).toBe("");
    expect(trimmed.street).toBe("");
    expect(trimmed.building).toBe("");
  });

  it("collapses a whitespace-only optional value to the empty string the payload omits", () => {
    const trimmed = trimFormValues({
      ...INITIAL_FORM,
      patronymic: "  ",
      state: "\t",
      apartment: " \n",
      comment: "\n ",
    });

    expect(trimmed.patronymic).toBe("");
    expect(trimmed.state).toBe("");
    expect(trimmed.apartment).toBe("");
    expect(trimmed.comment).toBe("");
  });

  it("leaves an already trimmed form untouched", () => {
    expect(trimFormValues(TRIMMED_FORM)).toStrictEqual(TRIMMED_FORM);
  });
});
