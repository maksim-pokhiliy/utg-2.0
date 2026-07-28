import { beforeEach, describe, expect, it } from "vitest";

import {
  composeCartLine,
  selectItemCount,
  selectSubtotal,
  useCartStore,
  type ICartItem,
  type ICartLineInput,
} from "@root/store/cart";

const PATCH_SLUG = "waiting";
const PATCH_TITLE = "«Waiting»";
const PATCH_PRICE = 300;
const PATCH_IMAGE = "/images/products/patches_waiting.jpg";
const PATCH_URL = "/uk/category/patches/waiting";
const SHIRT_ID = "death-black::M";
const SHIRT_PRICE = 1000;
const SIZE = "M";

const lineInput = (
  overrides: Partial<ICartLineInput> = {}
): ICartLineInput => ({
  slug: PATCH_SLUG,
  title: PATCH_TITLE,
  size: null,
  price: PATCH_PRICE,
  quantity: 1,
  image: PATCH_IMAGE,
  productUrl: PATCH_URL,
  ...overrides,
});

const cartItem = (overrides: Partial<ICartItem> = {}): ICartItem => ({
  id: PATCH_SLUG,
  title: PATCH_TITLE,
  price: PATCH_PRICE,
  quantity: 1,
  image: PATCH_IMAGE,
  productUrl: PATCH_URL,
  ...overrides,
});

const readItems = (): ICartItem[] => useCartStore.getState().items;

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("composeCartLine", () => {
  it("keeps the bare slug as the line id when the product has no size", () => {
    expect(composeCartLine(lineInput()).id).toBe(PATCH_SLUG);
  });

  it("keeps the bare title when the product has no size", () => {
    expect(composeCartLine(lineInput()).title).toBe(PATCH_TITLE);
  });

  it("joins the slug and the size with :: when the product has a size", () => {
    expect(composeCartLine(lineInput({ size: SIZE })).id).toBe("waiting::M");
  });

  it("joins the title and the size with a spaced middle dot when the product has a size", () => {
    expect(composeCartLine(lineInput({ size: SIZE })).title).toBe(
      "«Waiting» · M"
    );
  });

  it("carries the price, the image and the product url through untouched", () => {
    expect(composeCartLine(lineInput({ size: SIZE }))).toMatchObject({
      price: PATCH_PRICE,
      image: PATCH_IMAGE,
      productUrl: PATCH_URL,
    });
  });

  it("passes a zero quantity through without normalising it", () => {
    expect(composeCartLine(lineInput({ quantity: 0 })).quantity).toBe(0);
  });

  it("passes a negative quantity through without normalising it", () => {
    expect(composeCartLine(lineInput({ quantity: -3 })).quantity).toBe(-3);
  });

  it("passes a fractional quantity through without truncating it", () => {
    expect(composeCartLine(lineInput({ quantity: 2.9 })).quantity).toBe(2.9);
  });
});

describe("useCartStore.addItem", () => {
  it("normalises the zero quantity the encoder passed through", () => {
    useCartStore
      .getState()
      .addItem(composeCartLine(lineInput({ quantity: 0 })));

    expect(readItems()[0].quantity).toBe(1);
  });

  it("normalises a non-finite quantity the encoder passed through", () => {
    useCartStore
      .getState()
      .addItem(composeCartLine(lineInput({ quantity: Number.NaN })));

    expect(readItems()[0].quantity).toBe(1);
  });

  it("truncates the fractional quantity the encoder passed through", () => {
    useCartStore
      .getState()
      .addItem(composeCartLine(lineInput({ quantity: 2.9 })));

    expect(readItems()[0].quantity).toBe(2);
  });
});

describe("selectItemCount", () => {
  it("returns zero for an empty cart", () => {
    expect(selectItemCount(useCartStore.getState())).toBe(0);
  });

  it("sums the quantity of every line", () => {
    useCartStore.setState({
      items: [
        cartItem({ quantity: 2 }),
        cartItem({ id: SHIRT_ID, price: SHIRT_PRICE, quantity: 3 }),
      ],
    });

    expect(selectItemCount(useCartStore.getState())).toBe(5);
  });
});

describe("selectSubtotal", () => {
  it("returns zero for an empty cart", () => {
    expect(selectSubtotal(useCartStore.getState())).toBe(0);
  });

  it("multiplies every line price by its quantity", () => {
    useCartStore.setState({
      items: [
        cartItem({ quantity: 2 }),
        cartItem({ id: SHIRT_ID, price: SHIRT_PRICE, quantity: 3 }),
      ],
    });

    expect(selectSubtotal(useCartStore.getState())).toBe(3600);
  });
});

describe("the cart store on the server", () => {
  it("runs in an environment that has no window", () => {
    expect(typeof window).toBe("undefined");
  });

  it("leaves the cart empty when rehydrating without a window", async () => {
    await useCartStore.persist.rehydrate();

    expect(readItems()).toEqual([]);
  });

  it("does not throw when the mutators run without a window", () => {
    const line = composeCartLine(lineInput({ size: SIZE }));

    expect(() => {
      useCartStore.getState().addItem(line);
      useCartStore.getState().setQuantity(line.id, 4);
      useCartStore.getState().removeItem(line.id);
      useCartStore.getState().clear();
    }).not.toThrow();
  });
});
