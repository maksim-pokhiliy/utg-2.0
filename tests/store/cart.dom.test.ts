import { beforeEach, describe, expect, it } from "vitest";

import {
  CART_STORAGE_KEY,
  composeCartLine,
  useCartStore,
  type ICartItem,
  type ICartLineInput,
} from "@root/store/cart";

const PATCH_SLUG = "waiting";
const PATCH_TITLE = "«Waiting»";
const PATCH_PRICE = 300;
const PATCH_IMAGE = "/images/products/patches_waiting.jpg";
const PATCH_URL = "/uk/category/patches/waiting";
const SHIRT_SLUG = "death-black";
const SHIRT_TITLE = "«Death» Чорна";
const SHIRT_PRICE = 1000;
const SHIRT_IMAGE = "/images/products/BLACK.jpg";
const SHIRT_URL = "/uk/category/tshirts/death-black";
const SIZE_M = "M";
const SIZE_L = "L";

const NON_FINITE_QUANTITY_STORAGE =
  '[{"id":"waiting","title":"«Waiting»","price":300,"quantity":1e999,"image":"/images/products/patches_waiting.jpg","productUrl":"/uk/category/patches/waiting"}]';

const MALFORMED_STORAGE = '[{"id":"waiting",';

const NULL_LINE_STORAGE = "[null]";

const SCALAR_STORAGE = ['"waiting"', "5", "null", "true", "{}"];

interface IStoredLine {
  id: string;
  title: string;
  price: number;
  quantity: unknown;
  image: string;
  productUrl: string;
}

const storedLine = (overrides: Partial<IStoredLine> = {}): IStoredLine => ({
  id: PATCH_SLUG,
  title: PATCH_TITLE,
  price: PATCH_PRICE,
  quantity: 1,
  image: PATCH_IMAGE,
  productUrl: PATCH_URL,
  ...overrides,
});

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

const shirtInput = (size: string): ICartLineInput =>
  lineInput({
    slug: SHIRT_SLUG,
    title: SHIRT_TITLE,
    size,
    price: SHIRT_PRICE,
    image: SHIRT_IMAGE,
    productUrl: SHIRT_URL,
  });

const seedStorage = (lines: readonly IStoredLine[]): void => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
};

const seedRawStorage = (raw: string): void => {
  window.localStorage.setItem(CART_STORAGE_KEY, raw);
};

const readStorage = (): unknown =>
  JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "null");

const readItems = (): ICartItem[] => useCartStore.getState().items;

const persistedStorage = () => {
  const { storage } = useCartStore.persist.getOptions();

  if (storage === undefined) {
    throw new Error("The cart store persists through no storage");
  }

  return storage;
};

const decodeStorage = async () => persistedStorage().getItem(CART_STORAGE_KEY);

const rehydrate = async (): Promise<void> => {
  await useCartStore.persist.rehydrate();
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("the persisted cart storage key", () => {
  it("stays utg-cart-v2 because live browsers already hold that key", () => {
    expect(CART_STORAGE_KEY).toBe("utg-cart-v2");
  });
});

describe("the cart storage decoder", () => {
  it("normalises a zero quantity to one", async () => {
    seedStorage([storedLine({ quantity: 0 })]);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(1);
  });

  it("normalises a negative quantity to one", async () => {
    seedStorage([storedLine({ quantity: -3 })]);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(1);
  });

  it("truncates a fractional quantity", async () => {
    seedStorage([storedLine({ quantity: 2.9 })]);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(2);
  });

  it("normalises a non-finite quantity to one", async () => {
    seedRawStorage(NON_FINITE_QUANTITY_STORAGE);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(1);
  });

  it("normalises a null quantity to one", async () => {
    seedStorage([storedLine({ quantity: null })]);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(1);
  });

  it("normalises a numeric string quantity to one because a string is not a finite number", async () => {
    seedStorage([storedLine({ quantity: "3" })]);
    await rehydrate();

    expect(readItems()[0].quantity).toBe(1);
  });

  it("returns the stored lines wrapped in a state envelope for a raw json array", async () => {
    const legacy = storedLine();
    seedStorage([legacy]);

    expect(await decodeStorage()).toEqual({
      state: { items: [legacy] },
      version: 0,
    });
  });

  it("returns null for a zustand state envelope so a nested shape never reaches the cart", async () => {
    seedRawStorage(
      JSON.stringify({ state: { items: [storedLine()] }, version: 0 })
    );

    expect(await decodeStorage()).toBeNull();
  });

  it("returns null for malformed json instead of throwing", async () => {
    seedRawStorage(MALFORMED_STORAGE);

    expect(await decodeStorage()).toBeNull();
  });

  it("returns null for an array holding a null line instead of throwing", async () => {
    seedRawStorage(NULL_LINE_STORAGE);

    expect(await decodeStorage()).toBeNull();
  });

  it.each(SCALAR_STORAGE)(
    "returns null for the top-level non-array payload %s",
    async (raw) => {
      seedRawStorage(raw);

      expect(await decodeStorage()).toBeNull();
    }
  );

  it.each(SCALAR_STORAGE)(
    "finishes hydration for the top-level non-array payload %s",
    async (raw) => {
      seedRawStorage(raw);

      let hasFinished = false;
      const unsubscribe = useCartStore.persist.onFinishHydration(() => {
        hasFinished = true;
      });

      await rehydrate();
      unsubscribe();

      expect(hasFinished).toBe(true);
    }
  );

  it("finishes hydration for an array holding a null line so the checkout screen never stalls", async () => {
    seedRawStorage(NULL_LINE_STORAGE);

    let hasFinished = false;
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      hasFinished = true;
    });

    await rehydrate();
    unsubscribe();

    expect(hasFinished).toBe(true);
  });

  it("keeps a legacy bare-slug line intact", async () => {
    const legacy = storedLine();
    seedStorage([legacy]);
    await rehydrate();

    expect(readItems()).toEqual([legacy]);
  });

  it("leaves a legacy line id free of a size suffix", async () => {
    seedStorage([storedLine()]);
    await rehydrate();

    expect(readItems()[0].id).toBe(PATCH_SLUG);
  });
});

describe("the cart storage encoder", () => {
  it("writes a bare json array rather than a zustand state envelope", () => {
    useCartStore.getState().addItem(composeCartLine(lineInput()));

    expect(Array.isArray(readStorage())).toBe(true);
  });

  it("writes every field of the persisted line", () => {
    const line = composeCartLine(lineInput({ size: SIZE_M, quantity: 2 }));
    useCartStore.getState().addItem(line);

    expect(readStorage()).toEqual([line]);
  });

  it("writes a legacy bare-slug line back without migrating its id", async () => {
    const legacy = storedLine();
    seedStorage([legacy]);
    await rehydrate();
    useCartStore.getState().setQuantity(PATCH_SLUG, 2);

    expect(readStorage()).toEqual([{ ...legacy, quantity: 2 }]);
  });

  it("writes an empty array when the cart is cleared", () => {
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().clear();

    expect(readStorage()).toEqual([]);
  });
});

describe("useCartStore.addItem", () => {
  it("sums the quantity when the same line is added twice", () => {
    useCartStore
      .getState()
      .addItem(composeCartLine(lineInput({ quantity: 2 })));
    useCartStore
      .getState()
      .addItem(composeCartLine(lineInput({ quantity: 3 })));

    expect(readItems()).toHaveLength(1);
    expect(readItems()[0].quantity).toBe(5);
  });

  it("keeps the existing line title, price, image and product url when merging", () => {
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().addItem(
      composeCartLine(
        lineInput({
          title: SHIRT_TITLE,
          price: SHIRT_PRICE,
          image: SHIRT_IMAGE,
          productUrl: SHIRT_URL,
        })
      )
    );

    expect(readItems()[0]).toMatchObject({
      title: PATCH_TITLE,
      price: PATCH_PRICE,
      image: PATCH_IMAGE,
      productUrl: PATCH_URL,
    });
  });

  it("keeps two sizes of the same product as separate lines", () => {
    useCartStore.getState().addItem(composeCartLine(shirtInput(SIZE_M)));
    useCartStore.getState().addItem(composeCartLine(shirtInput(SIZE_L)));

    expect(readItems().map((item) => item.id)).toEqual([
      "death-black::M",
      "death-black::L",
    ]);
  });
});

describe("useCartStore.setQuantity", () => {
  it("normalises a zero quantity to one", () => {
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().setQuantity(PATCH_SLUG, 0);

    expect(readItems()[0].quantity).toBe(1);
  });

  it("leaves every other line untouched", () => {
    useCartStore.getState().addItem(composeCartLine(shirtInput(SIZE_M)));
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().setQuantity(PATCH_SLUG, 4);

    expect(readItems().map((item) => item.quantity)).toEqual([1, 4]);
  });
});

describe("useCartStore.removeItem", () => {
  it("removes only the requested line", () => {
    useCartStore.getState().addItem(composeCartLine(shirtInput(SIZE_M)));
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().removeItem(PATCH_SLUG);

    expect(readItems().map((item) => item.id)).toEqual(["death-black::M"]);
  });
});

describe("useCartStore.clear", () => {
  it("empties the cart", () => {
    useCartStore.getState().addItem(composeCartLine(shirtInput(SIZE_M)));
    useCartStore.getState().addItem(composeCartLine(lineInput()));
    useCartStore.getState().clear();

    expect(readItems()).toEqual([]);
  });
});
