import { describe, expect, it } from "vitest";

import {
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CHANNEL,
  type CheckoutFormValues,
} from "@root/components/checkout/fields";
import {
  composeOrderPayload,
  type ComposeOrderInput,
  type OrderPayloadV2,
} from "@root/components/checkout/payload";
import { composeCartLine, type ICartItem } from "@root/store/cart";
import type { IMoney } from "@root/utils/formatPrice";

interface AnnotatedCartLine extends ICartItem {
  note: string;
  is_gift: boolean;
}

const TYPED_PHONE = "067 123 45 67";

const NORMALIZED_PHONE = "+380671234567";

const IDEMPOTENCY_KEY = "3f2b8c1e-9a44-4d7e-8b2f-16c0a9e5d731";

const USD_RATE = 0.024;

const UAH_MONEY: IMoney = { coefficient: 1, currency: "UAH" };

const USD_MONEY: IMoney = { coefficient: USD_RATE, currency: "USD" };

const TOP_LEVEL_KEYS: readonly string[] = [
  "cart",
  "comment",
  "currency",
  "customer",
  "delivery",
  "idempotency_key",
  "locale",
  "total",
  "version",
];

const REQUIRED_TOP_LEVEL_KEYS: readonly string[] = [
  "cart",
  "currency",
  "customer",
  "delivery",
  "locale",
  "total",
  "version",
];

const CART_LINE_KEYS: readonly string[] = [
  "id",
  "image",
  "price",
  "productUrl",
  "quantity",
  "title",
];

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

const FILLED_VALUES: CheckoutFormValues = {
  last_name: "Шевченко",
  first_name: "Марія",
  patronymic: "Іванівна",
  telephone: TYPED_PHONE,
  country: "Україна",
  state: "Львівська область",
  city: "Львів",
  address: "Вулиця Казкового Міста 1",
  comment: "після 18:00",
};

const MINIMAL_VALUES: CheckoutFormValues = {
  ...FILLED_VALUES,
  patronymic: "",
  state: "",
  comment: "",
};

const compose = (overrides: Partial<ComposeOrderInput> = {}): OrderPayloadV2 =>
  composeOrderPayload({
    values: FILLED_VALUES,
    phone: NORMALIZED_PHONE,
    channel: DEFAULT_CONTACT_CHANNEL,
    cart: [PATCH],
    locale: "uk",
    money: UAH_MONEY,
    idempotencyKey: IDEMPOTENCY_KEY,
    ...overrides,
  });

describe("the v2 order envelope — the shop's half of the contract in initiatives/ua-checkout/requirements.md §5", () => {
  it("stamps version 2 so the relay can tell it from the v1 body", () => {
    expect(compose().version).toBe(2);
  });

  it("sends exactly the top-level keys §5 names when every optional field is filled", () => {
    expect(Object.keys(compose()).sort()).toEqual([...TOP_LEVEL_KEYS]);
  });

  it("passes the locale through untouched", () => {
    expect(compose({ locale: "en" }).locale).toBe("en");
  });
});

describe("the customer block", () => {
  it("nests the recipient under customer with the keys §5 names", () => {
    expect(compose().customer).toStrictEqual({
      first_name: "Марія",
      last_name: "Шевченко",
      patronymic: "Іванівна",
      phone: NORMALIZED_PHONE,
      contact_channel: DEFAULT_CONTACT_CHANNEL,
    });
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
});

describe("the delivery block", () => {
  it("ships delivery.mode generic under locale uk, which is the shape this whole window sends", () => {
    const payload = compose({ locale: "uk" });

    expect(payload.locale).toBe("uk");
    expect(payload.delivery.mode).toBe("generic");
  });

  it("ships the same generic mode under locale en, because neither side infers one from the other", () => {
    expect(compose({ locale: "en" }).delivery.mode).toBe("generic");
  });

  it("carries no source field, which belongs to the Нова Пошта variants alone", () => {
    expect(Object.keys(compose().delivery)).not.toContain("source");
  });

  it("nests the address under delivery with the keys §5 names", () => {
    expect(compose().delivery).toStrictEqual({
      mode: "generic",
      country: "Україна",
      state: "Львівська область",
      city: "Львів",
      address: "Вулиця Казкового Міста 1",
    });
  });
});

describe("the optional fields of the envelope", () => {
  it("omits every optional field rather than sending an empty string", () => {
    const payload = compose({
      values: MINIMAL_VALUES,
      idempotencyKey: undefined,
    });

    expect(Object.keys(payload).sort()).toEqual([...REQUIRED_TOP_LEVEL_KEYS]);
    expect(Object.keys(payload)).not.toContain("comment");
    expect(Object.keys(payload)).not.toContain("idempotency_key");
    expect(Object.keys(payload.customer)).not.toContain("patronymic");
    expect(Object.keys(payload.delivery)).not.toContain("state");
  });

  it("sends each optional field once it carries something the operator can read", () => {
    const payload = compose();

    expect(payload.customer.patronymic).toBe("Іванівна");
    expect(payload.delivery.state).toBe("Львівська область");
    expect(payload.comment).toBe("після 18:00");
  });

  it("carries the idempotency key when one was minted", () => {
    expect(compose().idempotency_key).toBe(IDEMPOTENCY_KEY);
  });

  it("omits the idempotency key entirely when the platform minted none", () => {
    const payload = compose({ idempotencyKey: undefined });

    expect(Object.keys(payload)).not.toContain("idempotency_key");
    expect(payload.idempotency_key).toBeUndefined();
  });
});

describe("the cart lines", () => {
  it("sends every cart line with the six keys the relay forwards today", () => {
    expect(Object.keys(compose().cart[0]).sort()).toEqual([...CART_LINE_KEYS]);
  });

  it("carries the values of the line through untouched", () => {
    expect(compose().cart[0]).toStrictEqual(PATCH);
  });

  it("drops keys a cart line never declared instead of forwarding them", () => {
    const payload = compose({ cart: [ANNOTATED_LINE] });

    expect(Object.keys(payload.cart[0]).sort()).toEqual([...CART_LINE_KEYS]);
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

  it("passes the display currency through untouched", () => {
    expect(compose({ money: USD_MONEY }).currency).toBe("USD");
  });

  it("states the currency explicitly, so an en order priced in UAH is never read as USD", () => {
    const payload = compose({ locale: "en", money: UAH_MONEY });

    expect(payload.locale).toBe("en");
    expect(payload.currency).toBe("UAH");
    expect(payload.total).toBe("600.00");
  });
});
