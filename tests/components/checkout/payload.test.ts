import { describe, expect, it } from "vitest";

import type {
  NpMethod,
  SettlementChoice,
  WarehouseChoice,
} from "@root/components/checkout/delivery";
import {
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CHANNEL,
  INITIAL_FORM,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";
import {
  composeOrderPayload,
  type ComposeOrderInput,
  type DeliverySelection,
  type GenericDelivery,
  type NpCourierDelivery,
  type NpWarehouseDelivery,
  type OrderPayloadV2,
} from "@root/components/checkout/payload";
import type { Locale } from "@root/data";
import {
  MAX_CART_QUANTITY,
  composeCartLine,
  type ICartItem,
} from "@root/store/cart";
import type { IMoney } from "@root/utils/formatPrice";

interface AnnotatedCartLine extends ICartItem {
  note: string;
  is_gift: boolean;
}

const UK_LOCALE: Locale = "uk";
const EN_LOCALE: Locale = "en";

const BRANCH_METHOD: NpMethod = "np_branch";
const POSTOMAT_METHOD: NpMethod = "np_postomat";
const COURIER_METHOD: NpMethod = "np_courier";

const BRANCH_MODE = "np_branch";
const POSTOMAT_MODE = "np_postomat";
const COURIER_MODE = "np_courier";
const GENERIC_MODE = "generic";

const DIRECTORY_SOURCE = "np_directory";
const MANUAL_SOURCE = "manual";

const TYPED_PHONE = "067 123 45 67";

const NORMALIZED_PHONE = "+380671234567";

const IDEMPOTENCY_KEY = "3f2b8c1e-9a44-4d7e-8b2f-16c0a9e5d731";

const USD_RATE = 0.024;

const UAH_MONEY: IMoney = { coefficient: 1, currency: "UAH" };

const USD_MONEY: IMoney = { coefficient: USD_RATE, currency: "USD" };

const EMPTY_TEXT = "";

const WRONG_MODE_MESSAGE = "The payload composed an unexpected delivery mode: ";

const TOP_LEVEL_KEYS: readonly string[] = [
  "version",
  "idempotency_key",
  "locale",
  "customer",
  "delivery",
  "comment",
  "cart",
  "total",
  "currency",
];

const REQUIRED_TOP_LEVEL_KEYS: readonly string[] = [
  "version",
  "locale",
  "customer",
  "delivery",
  "cart",
  "total",
  "currency",
];

const CUSTOMER_KEYS: readonly string[] = [
  "first_name",
  "last_name",
  "patronymic",
  "phone",
  "contact_channel",
];

const DELIVERY_WAREHOUSE_KEYS: readonly string[] = [
  "mode",
  "source",
  "city",
  "warehouse",
  "warehouse_number",
];

const DELIVERY_WAREHOUSE_TYPED_KEYS: readonly string[] = [
  "mode",
  "source",
  "city",
  "warehouse",
];

const DELIVERY_COURIER_KEYS: readonly string[] = [
  "mode",
  "source",
  "city",
  "street",
  "building",
  "apartment",
];

const DELIVERY_COURIER_HOUSE_KEYS: readonly string[] = [
  "mode",
  "source",
  "city",
  "street",
  "building",
];

const DELIVERY_GENERIC_KEYS: readonly string[] = [
  "mode",
  "country",
  "state",
  "city",
  "address",
];

const DELIVERY_GENERIC_REQUIRED_KEYS: readonly string[] = [
  "mode",
  "country",
  "city",
  "address",
];

const CART_LINE_KEYS: readonly string[] = [
  "id",
  "image",
  "price",
  "productUrl",
  "quantity",
  "title",
];

const LAST_NAME = "Шевченко";
const FIRST_NAME = "Марія";
const PATRONYMIC = "Іванівна";
const COMMENT = "після 18:00";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const CITY_LABEL = "с. Київець";
const CITY_REGION = "Миколаївський р-н, Львівська обл.";
const CITY_PRESENT = "с. Київець, Миколаївський р-н, Львівська обл.";
const TYPED_CITY = "київець під Львовом";

const WAREHOUSE_NUMBER = "1";
const WAREHOUSE_LABEL = "Відділення №1: вул. Городоцька, 359";
const TYPED_WAREHOUSE = "відділення 12 біля ринку";

const STREET = "вул. Городоцька";
const BUILDING = "359";
const APARTMENT = "12";

const COUNTRY = "Україна";
const STATE = "Львівська область";
const CITY = "Львів";
const ADDRESS = "Вулиця Казкового Міста 1";

const CITY_CHOICE: SettlementChoice = {
  ref: CITY_REF,
  label: CITY_LABEL,
  region: CITY_REGION,
  warehouseCount: 12_298,
  isCourierAllowed: true,
};

const WAREHOUSE_CHOICE: WarehouseChoice = {
  number: WAREHOUSE_NUMBER,
  label: WAREHOUSE_LABEL,
};

const PATCH: ICartItem = {
  id: "waiting",
  title: "«Waiting»",
  price: 300,
  quantity: 2,
  image: "/images/products/patches_waiting.jpg",
  productUrl: "/uk/category/patches/waiting",
};

const SHIRT: ICartItem = composeCartLine({
  slug: "death-black",
  title: "«Death» Чорна",
  size: "L",
  price: 1000,
  quantity: 1,
  image: "/images/products/tshirts_death_black.jpg",
  productUrl: "/uk/category/tshirts/death-black",
});

const ANNOTATED_LINE: AnnotatedCartLine = {
  ...PATCH,
  note: "an internal field the relay must never be handed",
  is_gift: true,
};

const EN_VALUES: CheckoutFormValues = {
  ...INITIAL_FORM,
  last_name: LAST_NAME,
  first_name: FIRST_NAME,
  patronymic: PATRONYMIC,
  telephone: TYPED_PHONE,
  country: COUNTRY,
  state: STATE,
  city: CITY,
  address: ADDRESS,
  comment: COMMENT,
};

const MINIMAL_EN_VALUES: CheckoutFormValues = {
  ...EN_VALUES,
  patronymic: EMPTY_TEXT,
  state: EMPTY_TEXT,
  comment: EMPTY_TEXT,
};

const UK_VALUES: CheckoutFormValues = {
  ...INITIAL_FORM,
  last_name: LAST_NAME,
  first_name: FIRST_NAME,
  patronymic: PATRONYMIC,
  telephone: TYPED_PHONE,
  np_city: TYPED_CITY,
  np_warehouse: WAREHOUSE_LABEL,
  street: STREET,
  building: BUILDING,
  apartment: APARTMENT,
  comment: COMMENT,
};

const deliverySelection = (
  overrides: Partial<DeliverySelection> = {}
): DeliverySelection => ({
  method: BRANCH_METHOD,
  cityChoice: CITY_CHOICE,
  warehouseChoice: WAREHOUSE_CHOICE,
  ...overrides,
});

const compose = (overrides: Partial<ComposeOrderInput> = {}): OrderPayloadV2 =>
  composeOrderPayload({
    values: EN_VALUES,
    phone: NORMALIZED_PHONE,
    channel: DEFAULT_CONTACT_CHANNEL,
    cart: [PATCH],
    locale: EN_LOCALE,
    money: UAH_MONEY,
    delivery: deliverySelection(),
    idempotencyKey: IDEMPOTENCY_KEY,
    ...overrides,
  });

const composeNp = (
  selection: Partial<DeliverySelection> = {},
  overrides: Partial<ComposeOrderInput> = {}
): OrderPayloadV2 =>
  compose({
    locale: UK_LOCALE,
    values: UK_VALUES,
    delivery: deliverySelection(selection),
    ...overrides,
  });

const sorted = (names: readonly string[]): string[] => [...names].sort();

const keysOf = (value: object): string[] => sorted(Object.keys(value));

const warehouseDelivery = (payload: OrderPayloadV2): NpWarehouseDelivery => {
  const { delivery } = payload;

  if (delivery.mode === BRANCH_MODE || delivery.mode === POSTOMAT_MODE) {
    return delivery;
  }

  throw new Error(`${WRONG_MODE_MESSAGE}${delivery.mode}`);
};

const courierDelivery = (payload: OrderPayloadV2): NpCourierDelivery => {
  const { delivery } = payload;

  if (delivery.mode === COURIER_MODE) {
    return delivery;
  }

  throw new Error(`${WRONG_MODE_MESSAGE}${delivery.mode}`);
};

const genericDelivery = (payload: OrderPayloadV2): GenericDelivery => {
  const { delivery } = payload;

  if (delivery.mode === GENERIC_MODE) {
    return delivery;
  }

  throw new Error(`${WRONG_MODE_MESSAGE}${delivery.mode}`);
};

const CROSS_MODE_ENVELOPE: OrderPayloadV2 = {
  version: 2,
  locale: UK_LOCALE,
  customer: {
    first_name: FIRST_NAME,
    last_name: LAST_NAME,
    phone: NORMALIZED_PHONE,
    contact_channel: DEFAULT_CONTACT_CHANNEL,
  },
  delivery: {
    mode: GENERIC_MODE,
    country: COUNTRY,
    city: CITY,
    address: ADDRESS,
  },
  cart: [],
  total: "0.00",
  currency: "UAH",
};

describe("the v2 order envelope — the shop's half of the contract in initiatives/ua-checkout/requirements.md §5, whose other half is pinned by the relay in ../utg-tg-order-bot/tests/support/contract.ts (ORDER_KEYS, ORDER_CUSTOMER_KEYS, ORDER_DELIVERY_BRANCH_KEYS, ORDER_DELIVERY_COURIER_KEYS, ORDER_DELIVERY_GENERIC_KEYS)", () => {
  it("stamps version 2, the only envelope the relay still decodes", () => {
    expect(compose().version).toBe(2);
    expect(composeNp().version).toBe(2);
  });

  it("sends exactly the top-level keys §5 names when every optional field is filled", () => {
    expect(keysOf(compose())).toEqual(sorted(TOP_LEVEL_KEYS));
    expect(keysOf(composeNp())).toEqual(sorted(TOP_LEVEL_KEYS));
  });

  it("passes the locale through untouched", () => {
    expect(compose({ locale: EN_LOCALE }).locale).toBe(EN_LOCALE);
    expect(composeNp().locale).toBe(UK_LOCALE);
  });
});

describe("the customer block", () => {
  it("nests the recipient under customer with the keys §5 names", () => {
    expect(compose().customer).toStrictEqual({
      first_name: FIRST_NAME,
      last_name: LAST_NAME,
      patronymic: PATRONYMIC,
      phone: NORMALIZED_PHONE,
      contact_channel: DEFAULT_CONTACT_CHANNEL,
    });
    expect(keysOf(compose().customer)).toEqual(sorted(CUSTOMER_KEYS));
  });

  it("sends the normalized phone the validator produced, never the typed value", () => {
    const { customer } = compose();

    expect(customer.phone).toBe(NORMALIZED_PHONE);
    expect(customer.phone).not.toBe(TYPED_PHONE);
  });

  it("offers exactly the call, telegram and viber triple §5 pins", () => {
    expect([...CONTACT_CHANNELS]).toEqual(["call", "telegram", "viber"]);
  });

  it.each(CONTACT_CHANNELS)(
    "carries %s to the relay verbatim and in lowercase",
    (channel) => {
      expect(compose({ channel }).customer.contact_channel).toBe(channel);
    }
  );

  it("composes the same customer block whatever the delivery mode turns out to be", () => {
    expect(composeNp().customer).toStrictEqual(compose().customer);
  });
});

describe("the generic delivery block of an en order", () => {
  it("ships delivery.mode generic under the en locale", () => {
    const payload = compose({ locale: EN_LOCALE });

    expect(payload.locale).toBe(EN_LOCALE);
    expect(payload.delivery.mode).toBe(GENERIC_MODE);
  });

  it("carries no source field, which belongs to the Нова Пошта variants alone", () => {
    expect(Object.keys(compose().delivery)).not.toContain("source");
  });

  it("nests the address under delivery with the keys §5 names", () => {
    expect(compose().delivery).toStrictEqual({
      mode: GENERIC_MODE,
      country: COUNTRY,
      state: STATE,
      city: CITY,
      address: ADDRESS,
    });
    expect(keysOf(compose().delivery)).toEqual(sorted(DELIVERY_GENERIC_KEYS));
  });

  it("drops the region from the key set when the buyer left it empty", () => {
    const payload = compose({ values: MINIMAL_EN_VALUES });

    expect(keysOf(payload.delivery)).toEqual(
      sorted(DELIVERY_GENERIC_REQUIRED_KEYS)
    );
    expect(genericDelivery(payload).state).toBeUndefined();
  });

  it("reads nothing from the Нова Пошта fields, even with a directory selection in hand", () => {
    const payload = compose({
      values: { ...EN_VALUES, np_city: TYPED_CITY, street: STREET },
      delivery: deliverySelection(),
    });

    expect(keysOf(payload.delivery)).toEqual(sorted(DELIVERY_GENERIC_KEYS));
    expect(genericDelivery(payload).city).toBe(CITY);
  });
});

describe("the warehouse delivery block of a uk branch or postomat order", () => {
  it("ships the branch mode the buyer selected", () => {
    expect(composeNp({ method: BRANCH_METHOD }).delivery.mode).toBe(
      BRANCH_MODE
    );
  });

  it("ships the postomat mode the buyer selected, which is a different wire value", () => {
    expect(composeNp({ method: POSTOMAT_METHOD }).delivery.mode).toBe(
      POSTOMAT_MODE
    );
  });

  it("sends exactly the five keys the relay's branch array names when the warehouse came from the directory", () => {
    const payload = composeNp();

    expect(keysOf(payload.delivery)).toEqual(sorted(DELIVERY_WAREHOUSE_KEYS));
    expect(payload.delivery).toStrictEqual({
      mode: BRANCH_MODE,
      source: DIRECTORY_SOURCE,
      city: CITY_PRESENT,
      warehouse: WAREHOUSE_LABEL,
      warehouse_number: WAREHOUSE_NUMBER,
    });
  });

  it("rejoins the region onto the settlement, because a truncated city loses the raion that tells two same-named villages apart", () => {
    expect(warehouseDelivery(composeNp()).city).toBe(CITY_PRESENT);
    expect(warehouseDelivery(composeNp()).city).not.toBe(CITY_LABEL);
  });

  it("sends the typed settlement verbatim once the buyer typed it instead of picking it", () => {
    const payload = composeNp({ cityChoice: null, warehouseChoice: null });

    expect(warehouseDelivery(payload).city).toBe(TYPED_CITY);
  });

  it("omits warehouse_number entirely for a hand-typed warehouse, rather than sending an empty one or a number parsed out of the text", () => {
    const payload = composeNp(
      { warehouseChoice: null },
      { values: { ...UK_VALUES, np_warehouse: TYPED_WAREHOUSE } }
    );
    const delivery = warehouseDelivery(payload);

    expect(keysOf(delivery)).toEqual(sorted(DELIVERY_WAREHOUSE_TYPED_KEYS));
    expect(Object.keys(delivery)).not.toContain("warehouse_number");
    expect(delivery.warehouse_number).toBeUndefined();
    expect(delivery.warehouse).toBe(TYPED_WAREHOUSE);
  });

  it("reports the directory as the source when both the settlement and the warehouse were picked", () => {
    expect(warehouseDelivery(composeNp()).source).toBe(DIRECTORY_SOURCE);
  });

  it("reports manual as the source the moment either half was typed, so the operator knows to verify on the call", () => {
    expect(warehouseDelivery(composeNp({ warehouseChoice: null })).source).toBe(
      MANUAL_SOURCE
    );
    expect(warehouseDelivery(composeNp({ cityChoice: null })).source).toBe(
      MANUAL_SOURCE
    );
  });

  it("reads nothing from the courier fields, which the warehouse form never rendered", () => {
    const delivery = warehouseDelivery(composeNp());

    expect(Object.keys(delivery)).not.toContain("street");
    expect(Object.keys(delivery)).not.toContain("building");
    expect(Object.keys(delivery)).not.toContain("apartment");
  });
});

describe("the courier delivery block of a uk order", () => {
  it("sends exactly the six keys the relay's courier array names when the apartment is filled", () => {
    const payload = composeNp({ method: COURIER_METHOD });

    expect(keysOf(payload.delivery)).toEqual(sorted(DELIVERY_COURIER_KEYS));
    expect(payload.delivery).toStrictEqual({
      mode: COURIER_MODE,
      source: DIRECTORY_SOURCE,
      city: CITY_PRESENT,
      street: STREET,
      building: BUILDING,
      apartment: APARTMENT,
    });
  });

  it("omits the apartment entirely for a private house rather than sending an empty string", () => {
    const payload = composeNp(
      { method: COURIER_METHOD },
      { values: { ...UK_VALUES, apartment: EMPTY_TEXT } }
    );

    expect(keysOf(payload.delivery)).toEqual(
      sorted(DELIVERY_COURIER_HOUSE_KEYS)
    );
    expect(Object.keys(payload.delivery)).not.toContain("apartment");
    expect(courierDelivery(payload).apartment).toBeUndefined();
  });

  it("reports the directory as the source on a picked settlement, because the street is free text by design", () => {
    expect(courierDelivery(composeNp({ method: COURIER_METHOD })).source).toBe(
      DIRECTORY_SOURCE
    );
  });

  it("reports manual once the settlement itself was typed by hand", () => {
    const payload = composeNp({ method: COURIER_METHOD, cityChoice: null });

    expect(courierDelivery(payload).source).toBe(MANUAL_SOURCE);
    expect(courierDelivery(payload).city).toBe(TYPED_CITY);
  });

  it("reads nothing from the warehouse fields, which the courier form never rendered", () => {
    const delivery = courierDelivery(composeNp({ method: COURIER_METHOD }));

    expect(Object.keys(delivery)).not.toContain("warehouse");
    expect(Object.keys(delivery)).not.toContain("warehouse_number");
  });
});

describe("the locale and the delivery mode, which §5 forbids either side from inferring from the other", () => {
  it("keeps a uk envelope carrying the generic delivery shape a legal v2 body, which is exactly what shipped through the U5a window", () => {
    expect(CROSS_MODE_ENVELOPE.locale).toBe(UK_LOCALE);
    expect(CROSS_MODE_ENVELOPE.delivery.mode).toBe(GENERIC_MODE);
    expect(keysOf(CROSS_MODE_ENVELOPE.delivery)).toEqual(
      sorted(DELIVERY_GENERIC_REQUIRED_KEYS)
    );
  });

  it("composes the Нова Пошта mode the buyer selected without asking the locale for permission", () => {
    for (const method of [BRANCH_METHOD, POSTOMAT_METHOD, COURIER_METHOD]) {
      expect(composeNp({ method }).delivery.mode, method).toBe(method);
    }
  });

  it("never lets a Нова Пошта selection turn an en order into a Нова Пошта one", () => {
    const payload = compose({ delivery: deliverySelection() });

    expect(payload.locale).toBe(EN_LOCALE);
    expect(payload.delivery.mode).toBe(GENERIC_MODE);
  });

  it("never lets the generic address fields turn a uk order into a generic one", () => {
    const payload = composeNp({}, { values: { ...UK_VALUES, city: CITY } });

    expect(payload.locale).toBe(UK_LOCALE);
    expect(payload.delivery.mode).toBe(BRANCH_MODE);
  });
});

describe("the optional fields of the envelope", () => {
  it("omits every optional field rather than sending an empty string", () => {
    const payload = compose({
      values: MINIMAL_EN_VALUES,
      idempotencyKey: undefined,
    });

    expect(keysOf(payload)).toEqual(sorted(REQUIRED_TOP_LEVEL_KEYS));
    expect(Object.keys(payload)).not.toContain("comment");
    expect(Object.keys(payload)).not.toContain("idempotency_key");
    expect(Object.keys(payload.customer)).not.toContain("patronymic");
    expect(Object.keys(payload.delivery)).not.toContain("state");
  });

  it("sends each optional field once it carries something the operator can read", () => {
    const payload = compose();

    expect(payload.customer.patronymic).toBe(PATRONYMIC);
    expect(genericDelivery(payload).state).toBe(STATE);
    expect(payload.comment).toBe(COMMENT);
  });

  it("carries the idempotency key when one was minted", () => {
    expect(compose().idempotency_key).toBe(IDEMPOTENCY_KEY);
    expect(composeNp().idempotency_key).toBe(IDEMPOTENCY_KEY);
  });

  it("omits the idempotency key entirely when the platform minted none", () => {
    const payload = compose({ idempotencyKey: undefined });

    expect(Object.keys(payload)).not.toContain("idempotency_key");
    expect(payload.idempotency_key).toBeUndefined();
  });
});

describe("the cart lines", () => {
  it("sends every cart line with the six keys the relay forwards today", () => {
    expect(keysOf(compose().cart[0])).toEqual(sorted(CART_LINE_KEYS));
  });

  it("carries the values of the line through untouched", () => {
    expect(compose().cart[0]).toStrictEqual(PATCH);
  });

  it("drops keys a cart line never declared instead of forwarding them", () => {
    const payload = compose({ cart: [ANNOTATED_LINE] });

    expect(keysOf(payload.cart[0])).toEqual(sorted(CART_LINE_KEYS));
    expect(Object.keys(payload.cart[0])).not.toContain("note");
    expect(Object.keys(payload.cart[0])).not.toContain("is_gift");
  });

  it("keeps the size inside the title of a sized line, where DEF-3 put it", () => {
    const payload = compose({ cart: [SHIRT] });

    expect(payload.cart[0].title).toBe("«Death» Чорна · L");
    expect(payload.cart[0].id).toBe("death-black::L");
  });

  it("sends an empty cart as an empty array instead of refusing to compose", () => {
    const payload = compose({ cart: [] });

    expect(payload.cart).toEqual([]);
    expect(payload.total).toBe("0.00");
  });

  it("serialises the same cart whatever delivery mode the order ends up in", () => {
    expect(composeNp({}, { cart: [PATCH, SHIRT] }).cart).toStrictEqual(
      compose({ cart: [PATCH, SHIRT] }).cart
    );
  });
});

describe("the money on the envelope", () => {
  it("computes the total from the same cart array it serialises", () => {
    const single = compose({ cart: [PATCH] });
    const both = compose({ cart: [PATCH, SHIRT] });

    expect(single.total).toBe("600.00");
    expect(both.cart).toHaveLength(2);
    expect(both.total).toBe("1600.00");
  });

  it("converts the total with the coefficient of the display currency", () => {
    expect(compose({ money: USD_MONEY }).total).toBe("14.40");
  });

  it("sends the total as a string with two fraction digits", () => {
    expect(compose().total).toBe("600.00");
  });

  it("keeps the total a plain decimal at the cart's quantity ceiling, because the relay refuses exponential notation outright", () => {
    const saturated = compose({
      cart: [{ ...PATCH, quantity: MAX_CART_QUANTITY }],
    });

    expect(saturated.total).toMatch(/^\d+\.\d{2}$/);
    expect(saturated.total).not.toContain("e");
  });

  it("passes the display currency through untouched", () => {
    expect(compose({ money: USD_MONEY }).currency).toBe("USD");
  });

  it("states the currency explicitly, so an en order priced in UAH is never read as USD", () => {
    const payload = compose({ locale: EN_LOCALE, money: UAH_MONEY });

    expect(payload.locale).toBe(EN_LOCALE);
    expect(payload.currency).toBe("UAH");
    expect(payload.total).toBe("600.00");
  });

  it("prices a Нова Пошта order in the same hryvnia the catalog states", () => {
    const payload = composeNp();

    expect(payload.currency).toBe("UAH");
    expect(payload.total).toBe("600.00");
  });
});
