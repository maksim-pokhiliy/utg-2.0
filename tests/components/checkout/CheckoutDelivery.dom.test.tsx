import { act, fireEvent, screen, within } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "@root/components/checkout/CheckoutForm";
import {
  composeCartLine,
  useCartStore,
  type ICartItem,
} from "@root/store/cart";

import {
  createDirectoryFetch,
  heldFailure,
  heldPastAbort,
  heldReply,
  rowsReply,
  type DirectoryFetch,
} from "../../support/directoryFetch";
import {
  EN_DICTIONARY,
  UK_DICTIONARY,
  renderWithI18n,
} from "../../support/renderWithI18n";

type I18nOptions = NonNullable<Parameters<typeof renderWithI18n>[1]>;

interface HarnessProps {
  onPlaced: () => void;
}

const DEBOUNCE_MS = 250;

const RETRY_DELAY_MS = 400;

const SETTLE_MS = DEBOUNCE_MS + RETRY_DELAY_MS;

const OK_STATUS = 200;

const THROTTLED_STATUS = 429;

const UNLISTED_SETTLEMENT = "Іванівка";

const TYPED_WAREHOUSE = "Відділення №2 біля школи";

const UNAVAILABLE_STATUS = 503;

const ORDER_ROUTE = "/api/place_order";

const BRANCH_PARAM = "method=branch";

const POSTOMAT_PARAM = "method=postomat";

const HIDDEN_SELECTOR = '[aria-hidden="true"]';

const OPTION_SELECTOR = '[role="option"]';

const CITY_FIELD = "np_city";

const WAREHOUSE_FIELD = "np_warehouse";

const TELEPHONE_FIELD = "telephone";

const LAST_NAME_FIELD = "last_name";

const FIRST_NAME_FIELD = "first_name";

const STREET_FIELD = "street";

const BUILDING_FIELD = "building";

const APARTMENT_FIELD = "apartment";

const EN_ADDRESS_FIELDS = ["country", "state", "city", "address"];

const UK_DELIVERY_FIELDS = [
  CITY_FIELD,
  WAREHOUSE_FIELD,
  STREET_FIELD,
  BUILDING_FIELD,
];

const LVIV = {
  ref: "lviv-ref",
  label: "Львів",
  region: "Львівська обл.",
  warehouseCount: 312,
  isCourierAllowed: true,
};

const KYIV = {
  ref: "kyiv-ref",
  label: "Київ",
  region: "Київська обл.",
  warehouseCount: 12298,
  isCourierAllowed: true,
};

const LVIV_TWIN = {
  ref: "lviv-ref",
  label: "Іванівка",
  region: "Полтавська обл.",
  warehouseCount: 3,
  isCourierAllowed: true,
};

const LOCKERLESS_VILLAGE = {
  ref: "village-ref",
  label: "Мале Село",
  region: "Київська обл.",
  warehouseCount: 0,
  isCourierAllowed: true,
};

const COURIERLESS_TOWN = {
  ref: "town-ref",
  label: "Дальнє Містечко",
  region: "Волинська обл.",
  warehouseCount: 2,
  isCourierAllowed: false,
};

const BRANCH_ROWS = [
  { number: "5", label: "Відділення №5: вул. Хрещатик, 1" },
  { number: "12", label: "Відділення №12: вул. Соборна, 4" },
];

const POSTOMAT_ROWS = [
  { number: "40100", label: "Поштомат №40100: вул. Лесі Українки, 7" },
];

const TWINNED_NUMBER = "5";

const TWINNED_NUMBER_ROWS = [
  { number: TWINNED_NUMBER, label: "Відділення №5: вул. Хрещатик, 1" },
  { number: TWINNED_NUMBER, label: "Пункт №5 (до 30 кг): вул. Хрещатик, 40" },
];

const LVIV_QUERY = "Льв";

const KYIV_QUERY = "Киї";

const VILLAGE_QUERY = "Мал";

const TOWN_QUERY = "Дал";

const ONE_LETTER_QUERY = "Л";

const TYPED_PHONE = "067 123 45 67";

const NORMALIZED_PHONE = "+380671234567";

const LAST_NAME = "Шевченко";

const FIRST_NAME = "Марія";

const MANUAL_CITY = "Львів";

const MANUAL_WAREHOUSE = "Відділення №5";

const FIRST_ROW = 0;

const SECOND_ROW = 1;

const TYPED_CHARACTER_COUNT = LVIV_QUERY.length;

const ONE_REQUEST = 1;

const HINT_ID = "np-fallback-hint";

const EMPTY_TEXT = "";

const CART_LINES: readonly ICartItem[] = [
  composeCartLine({
    slug: "waiting",
    title: "«Waiting»",
    size: null,
    price: 300,
    quantity: 1,
    image: "/images/products/patches_waiting.jpg",
    productUrl: "https://www.ua-tactical-gear.com/uk/category/patches/waiting",
  }),
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

let directory: DirectoryFetch = createDirectoryFetch();

let onPlaced = vi.fn<() => void>();

function PendingHarness({
  onPlaced: handlePlaced,
}: HarnessProps): ReactElement {
  const [isPending, setIsPending] = useState(false);

  return (
    <CheckoutForm
      isPending={isPending}
      onPendingChange={setIsPending}
      onPlaced={handlePlaced}
    />
  );
}

const renderCheckout = (options: I18nOptions = {}) =>
  renderWithI18n(<PendingHarness onPlaced={onPlaced} />, options);

const control = (id: string): HTMLInputElement => {
  const node = document.getElementById(id);

  if (!(node instanceof HTMLInputElement)) {
    throw new Error(`The checkout renders no ${id} input`);
  }

  return node;
};

const isRendered = (id: string): boolean =>
  document.getElementById(id) !== null;

const isCombobox = (id: string): boolean =>
  control(id).getAttribute("role") === "combobox";

const moveFocusTo = (node: HTMLElement): void => {
  act(() => {
    node.focus();
  });
};

const typeInto = (id: string, value: string): void => {
  fireEvent.change(control(id), { target: { value } });
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
  });
};

const searchIn = async (id: string, query: string): Promise<void> => {
  moveFocusTo(control(id));
  typeInto(id, query);
  await settle();
};

const panelOf = (id: string): HTMLElement | null =>
  document.getElementById(`${id}-listbox`);

const barsIn = (id: string): number => {
  const panel = panelOf(id);

  return panel === null ? 0 : panel.querySelectorAll(HIDDEN_SELECTOR).length;
};

const rowsIn = (id: string): Element[] => {
  const panel = panelOf(id);

  return panel === null
    ? []
    : Array.from(panel.querySelectorAll(OPTION_SELECTOR));
};

const pickRow = (id: string, index: number): void => {
  const row = rowsIn(id)[index];

  if (row === undefined) {
    throw new Error(`The ${id} panel offers no row number ${index + 1}`);
  }

  fireEvent.mouseDown(row);
};

const groupNamed = (caption: string): HTMLElement =>
  screen.getByRole("radiogroup", {
    name: (accessibleName: string) => accessibleName.startsWith(caption),
  });

const methodGroup = (): HTMLElement =>
  groupNamed(UK_DICTIONARY.cart.delivery_method);

const methodChips = (): HTMLElement[] =>
  within(methodGroup()).getAllByRole("radio");

const methodChip = (label: string): HTMLElement =>
  within(methodGroup()).getByRole("radio", { name: label });

const describedTextOf = (chip: HTMLElement): string | null => {
  const id = chip.getAttribute("aria-describedby");
  const node = id === null ? null : document.getElementById(id);

  return node === null ? null : node.textContent;
};

const pickCity = async (
  query: string,
  settlements: readonly unknown[]
): Promise<void> => {
  directory.queue("settlements", [rowsReply(settlements)]);
  await searchIn(CITY_FIELD, query);
  pickRow(CITY_FIELD, FIRST_ROW);
};

const fillContact = (): void => {
  typeInto(LAST_NAME_FIELD, LAST_NAME);
  typeInto(FIRST_NAME_FIELD, FIRST_NAME);
  typeInto(TELEPHONE_FIELD, TYPED_PHONE);
};

const orderButton = (): HTMLElement =>
  screen.getByRole("button", { name: UK_DICTIONARY.cart.place_order });

const submit = async (): Promise<void> => {
  await act(async () => {
    fireEvent.click(orderButton());
  });
};

const readOrderPayload = (): Record<string, unknown> => {
  const call = directory.mock.mock.calls.find(
    ([input]) => String(input) === ORDER_ROUTE
  );

  if (call === undefined) {
    throw new Error("The checkout posted no order");
  }

  const body = call[1]?.body;

  if (typeof body !== "string") {
    throw new Error("The checkout order carried no JSON string body");
  }

  const parsed: unknown = JSON.parse(body);

  if (!isRecord(parsed)) {
    throw new Error("The checkout order body is not a JSON object");
  }

  return parsed;
};

const readOrderGroup = (key: string): Record<string, unknown> => {
  const group = readOrderPayload()[key];

  if (!isRecord(group)) {
    throw new Error(`The checkout order carries no ${key} object`);
  }

  return group;
};

Element.prototype.scrollIntoView = function scrollIntoView(): void {};

beforeEach(() => {
  vi.useFakeTimers();
  useCartStore.setState({ items: [...CART_LINES] });
  directory = createDirectoryFetch();
  directory.queue("settlements", [rowsReply([LVIV, KYIV])]);
  directory.queue("warehouses", [rowsReply(BRANCH_ROWS)]);
  onPlaced = vi.fn<() => void>();
  vi.stubGlobal("fetch", directory.mock);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the delivery surface each locale gets", () => {
  it("offers the three Нова Пошта methods under uk and starts the shopper on the branch most volunteers use", () => {
    renderCheckout();

    expect(methodChips().map((chip) => chip.textContent)).toEqual([
      UK_DICTIONARY.cart.method_branch,
      UK_DICTIONARY.cart.method_postomat,
      UK_DICTIONARY.cart.method_courier,
    ]);
    expect(
      methodChip(UK_DICTIONARY.cart.method_branch).getAttribute("aria-checked")
    ).toBe("true");
    expect(
      within(methodGroup()).getAllByRole("radio", { checked: true })
    ).toHaveLength(1);
  });

  it("leaves en on the generic four-field address with no carrier chips at all, because en is a regression surface", () => {
    renderCheckout({ locale: "en", dictionary: EN_DICTIONARY });

    for (const name of EN_ADDRESS_FIELDS) {
      expect(isRendered(name), name).toBe(true);
    }

    for (const name of UK_DELIVERY_FIELDS) {
      expect(isRendered(name), name).toBe(false);
    }

    expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
    expect(
      screen.getByRole("radiogroup").getAttribute("aria-labelledby")
    ).not.toBeNull();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
  });

  it("renders no carrier fields under uk beyond the two the branch method needs", () => {
    renderCheckout();

    expect(isRendered(CITY_FIELD)).toBe(true);
    expect(isRendered(WAREHOUSE_FIELD)).toBe(true);
    expect(isRendered(STREET_FIELD)).toBe(false);

    for (const name of EN_ADDRESS_FIELDS) {
      expect(isRendered(name), name).toBe(false);
    }
  });
});

describe("a settlement the carrier serves with no branch and no locker", () => {
  it("disables both warehouse chips and says why, instead of hiding the method the shopper came looking for", async () => {
    renderCheckout();
    await pickCity(VILLAGE_QUERY, [LOCKERLESS_VILLAGE]);

    const branch = methodChip(UK_DICTIONARY.cart.method_branch);
    const postomat = methodChip(UK_DICTIONARY.cart.method_postomat);

    expect(branch.getAttribute("aria-disabled")).toBe("true");
    expect(postomat.getAttribute("aria-disabled")).toBe("true");
    expect(branch.hasAttribute("disabled")).toBe(false);
    expect(postomat.hasAttribute("disabled")).toBe(false);
    expect(
      screen.getByText(UK_DICTIONARY.cart.np_no_warehouses).textContent
    ).toBe(UK_DICTIONARY.cart.np_no_warehouses);
    expect(describedTextOf(branch)).toBe(UK_DICTIONARY.cart.np_no_warehouses);
    expect(describedTextOf(postomat)).toBe(UK_DICTIONARY.cart.np_no_warehouses);
  });

  it("moves the selection onto the courier the carrier does offer and swaps the warehouse field for the street pair", async () => {
    renderCheckout();
    await pickCity(VILLAGE_QUERY, [LOCKERLESS_VILLAGE]);

    expect(
      methodChip(UK_DICTIONARY.cart.method_courier).getAttribute("aria-checked")
    ).toBe("true");
    expect(
      methodChip(UK_DICTIONARY.cart.method_branch).getAttribute("aria-checked")
    ).toBe("false");
    expect(isRendered(WAREHOUSE_FIELD)).toBe(false);
    expect(isRendered(STREET_FIELD)).toBe(true);
    expect(isRendered(BUILDING_FIELD)).toBe(true);
    expect(isRendered(APARTMENT_FIELD)).toBe(true);
  });

  it("disables the courier chip with its own reason where the carrier refuses address delivery, and leaves the branch selected", async () => {
    renderCheckout();
    await pickCity(TOWN_QUERY, [COURIERLESS_TOWN]);

    const courier = methodChip(UK_DICTIONARY.cart.method_courier);

    expect(courier.getAttribute("aria-disabled")).toBe("true");
    expect(courier.hasAttribute("disabled")).toBe(false);
    expect(describedTextOf(courier)).toBe(UK_DICTIONARY.cart.np_no_courier);
    expect(
      methodChip(UK_DICTIONARY.cart.method_branch).getAttribute("aria-checked")
    ).toBe("true");
    expect(
      methodChip(UK_DICTIONARY.cart.method_branch).hasAttribute("aria-disabled")
    ).toBe(false);
  });
});

describe("the warehouse field's dependence on the settlement above it", () => {
  it("stays locked until a settlement is chosen, because the carrier cannot list branches for nowhere", async () => {
    renderCheckout();

    expect(control(WAREHOUSE_FIELD).disabled).toBe(true);

    await pickCity(LVIV_QUERY, [LVIV, KYIV]);

    expect(control(WAREHOUSE_FIELD).disabled).toBe(false);
  });

  it("drops the chosen branch when the shopper picks another settlement, so no order carries a branch from the wrong town", async () => {
    renderCheckout();
    fillContact();
    await pickCity(LVIV_QUERY, [LVIV]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();
    pickRow(WAREHOUSE_FIELD, FIRST_ROW);

    await pickCity(KYIV_QUERY, [KYIV]);
    typeInto(WAREHOUSE_FIELD, MANUAL_WAREHOUSE);

    await submit();

    const delivery = readOrderGroup("delivery");

    expect(delivery).not.toHaveProperty("warehouse_number");
    expect(delivery.source).toBe("manual");
    expect(delivery.city).toBe(`${KYIV.label}, ${KYIV.region}`);
  });

  it("resets the warehouse when the method switches between branch and locker, and asks the carrier nothing until the field is focused again", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();
    pickRow(WAREHOUSE_FIELD, FIRST_ROW);

    expect(directory.callsTo("warehouses")).toHaveLength(1);
    expect(directory.callsTo("warehouses")[0]).toContain(BRANCH_PARAM);

    directory.queue("warehouses", [rowsReply(POSTOMAT_ROWS)]);

    const postomat = methodChip(UK_DICTIONARY.cart.method_postomat);

    fireEvent.click(postomat);
    moveFocusTo(postomat);
    await settle();

    expect(directory.callsTo("warehouses")).toHaveLength(1);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(directory.callsTo("warehouses")).toHaveLength(2);
    expect(directory.callsTo("warehouses")[1]).toContain(POSTOMAT_PARAM);
    expect(rowsIn(WAREHOUSE_FIELD).map((row) => row.textContent)).toEqual(
      POSTOMAT_ROWS.map((row) => row.label)
    );
  });

  it("selects the pickup point that shares a branch's number as itself, because two places on one number are two rows", async () => {
    renderCheckout();
    fillContact();
    await pickCity(LVIV_QUERY, [LVIV]);

    directory.queue("warehouses", [rowsReply(TWINNED_NUMBER_ROWS)]);
    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(rowsIn(WAREHOUSE_FIELD).map((row) => row.textContent)).toEqual(
      TWINNED_NUMBER_ROWS.map((row) => row.label)
    );

    pickRow(WAREHOUSE_FIELD, SECOND_ROW);
    moveFocusTo(control(TELEPHONE_FIELD));
    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(directory.callsTo("warehouses")).toHaveLength(1);

    await submit();

    const delivery = readOrderGroup("delivery");

    expect(delivery.warehouse).toBe(TWINNED_NUMBER_ROWS[SECOND_ROW].label);
    expect(delivery.warehouse_number).toBe(TWINNED_NUMBER);
    expect(delivery.source).toBe("np_directory");
  });
});

describe("the option list the parent hands the combobox on every keystroke elsewhere", () => {
  it("keeps the active row where the shopper left it while another field re-renders the whole form", async () => {
    renderCheckout();
    await searchIn(CITY_FIELD, LVIV_QUERY);

    fireEvent.keyDown(control(CITY_FIELD), { key: "ArrowDown" });

    const active = control(CITY_FIELD).getAttribute("aria-activedescendant");

    expect(active).toBe(`${CITY_FIELD}-option-${SECOND_ROW}`);

    typeInto(TELEPHONE_FIELD, TYPED_PHONE);

    expect(control(CITY_FIELD).getAttribute("aria-activedescendant")).toBe(
      active
    );
    expect(rowsIn(CITY_FIELD)).toHaveLength(2);
    expect(rowsIn(CITY_FIELD)[SECOND_ROW].getAttribute("aria-selected")).toBe(
      "true"
    );
  });
});

describe("the loading bars, which must come down on every path they go up on", () => {
  it("raises them on the keystroke and lowers them when the settlements land", async () => {
    renderCheckout();

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, LVIV_QUERY);

    expect(barsIn(CITY_FIELD)).toBeGreaterThan(0);
    expect(rowsIn(CITY_FIELD)).toHaveLength(0);

    await settle();

    expect(barsIn(CITY_FIELD)).toBe(0);
    expect(rowsIn(CITY_FIELD)).toHaveLength(2);
  });

  it("raises and lowers them on the warehouse field too, once its branches land", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    moveFocusTo(control(WAREHOUSE_FIELD));

    expect(barsIn(WAREHOUSE_FIELD)).toBeGreaterThan(0);

    await settle();

    expect(barsIn(WAREHOUSE_FIELD)).toBe(0);
    expect(rowsIn(WAREHOUSE_FIELD)).toHaveLength(BRANCH_ROWS.length);
  });

  it("lowers them without asking the carrier anything when the query is one character short", async () => {
    renderCheckout();

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, ONE_LETTER_QUERY);

    expect(barsIn(CITY_FIELD)).toBeGreaterThan(0);

    await settle();

    expect(directory.callsTo("settlements")).toHaveLength(0);
    expect(barsIn(CITY_FIELD)).toBe(0);
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
  });

  it("lowers them without asking the carrier again when the field is returned to on the settlement already chosen", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    expect(directory.callsTo("settlements")).toHaveLength(1);

    moveFocusTo(control(TELEPHONE_FIELD));
    moveFocusTo(control(CITY_FIELD));

    expect(barsIn(CITY_FIELD)).toBeGreaterThan(0);

    await settle();

    expect(directory.callsTo("settlements")).toHaveLength(1);
    expect(barsIn(CITY_FIELD)).toBe(0);
  });

  it("lowers them when our own limiter answers 429, so a throttled field never spins forever", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: THROTTLED_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(barsIn(CITY_FIELD)).toBe(0);
    expect(screen.getByText(UK_DICTIONARY.cart.np_throttled).textContent).toBe(
      UK_DICTIONARY.cart.np_throttled
    );
  });

  it("tells a throttled buyer to wait rather than that their city does not exist", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: THROTTLED_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(screen.queryByText(UK_DICTIONARY.cart.np_empty)).toBeNull();
    expect(directory.callsTo("settlements")).toHaveLength(1);

    directory.queue("settlements", [rowsReply([LVIV, KYIV])]);
    typeInto(CITY_FIELD, KYIV_QUERY);
    await settle();

    expect(screen.queryByText(UK_DICTIONARY.cart.np_throttled)).toBeNull();
    expect(rowsIn(CITY_FIELD)).toHaveLength(2);
  });
});

describe("the fallback machine, which no directory failure may leave a volunteer stuck behind", () => {
  it("turns the settlement field into a plain text input on a 503, keeping the typed characters, the focus and the caret at their end", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    const city = control(CITY_FIELD);

    expect(isCombobox(CITY_FIELD)).toBe(false);
    expect(city.value).toBe(LVIV_QUERY);
    expect(document.activeElement).toBe(city);
    expect(city.selectionStart).toBe(TYPED_CHARACTER_COUNT);
    expect(city.selectionEnd).toBe(TYPED_CHARACTER_COUNT);
  });

  it("says why the list went away and unlocks the warehouse field the missing settlement used to gate", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(
      screen.getByText(UK_DICTIONARY.cart.np_fallback_hint).textContent
    ).toBe(UK_DICTIONARY.cart.np_fallback_hint);
    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);
    expect(control(WAREHOUSE_FIELD).disabled).toBe(false);
    expect(
      screen.getByLabelText(`${UK_DICTIONARY.cart.np_warehouse_fallback} *`)
    ).toBe(control(WAREHOUSE_FIELD));
  });

  it("keeps the combobox when the carrier answers 200 with nothing, because a settlement with no match is a fact and not an outage", async () => {
    renderCheckout();
    directory.queue("settlements", [rowsReply([])]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("keeps the combobox on a 429, because our own rate limit is not the carrier going down", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: THROTTLED_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("leaves the settlement combobox live when only the warehouse lookup falls over", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    directory.queue("warehouses", [{ status: UNAVAILABLE_STATUS }]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);
    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(
      screen.getByText(UK_DICTIONARY.cart.np_fallback_hint_warehouse)
        .textContent
    ).toBe(UK_DICTIONARY.cart.np_fallback_hint_warehouse);
  });

  it("retries once before falling back, so a refusal the proxy answers while it is saturated never costs the buyer the list", async () => {
    renderCheckout();
    directory.queue("settlements", [
      { status: UNAVAILABLE_STATUS },
      rowsReply([LVIV, KYIV]),
    ]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(directory.callsTo("settlements")).toHaveLength(2);
    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(rowsIn(CITY_FIELD)).toHaveLength(2);
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("takes the settlement list back once the buyer leaves the field and the directory answers again, without stealing the caret", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(false);

    directory.queue("settlements", [rowsReply([LVIV, KYIV])]);

    fireEvent.blur(control(CITY_FIELD));
    await settle();

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(control(CITY_FIELD).value).toBe(LVIV_QUERY);
    expect(document.activeElement).toBe(document.body);
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("takes the warehouse list back when the buyer leaves that field and the directory answers again", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    directory.queue("warehouses", [{ status: UNAVAILABLE_STATUS }]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);

    directory.queue("warehouses", [rowsReply(BRANCH_ROWS)]);

    fireEvent.blur(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(true);
    expect(isCombobox(CITY_FIELD)).toBe(true);
  });

  it("keeps the buyer's focus when the un-latch lands while they are back in the field", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(false);

    directory.queue("settlements", [rowsReply([LVIV, KYIV])]);

    moveFocusTo(control(CITY_FIELD));
    moveFocusTo(control(TELEPHONE_FIELD));
    moveFocusTo(control(CITY_FIELD));
    await settle();

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(document.activeElement?.id).toBe(CITY_FIELD);
  });

  it("keeps focus when the warehouse un-latch lands while the buyer is back in that field", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    directory.queue("warehouses", [{ status: UNAVAILABLE_STATUS }]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);

    directory.queue("warehouses", [rowsReply(BRANCH_ROWS)]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    moveFocusTo(control(TELEPHONE_FIELD));
    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(true);
    expect(document.activeElement?.id).toBe(WAREHOUSE_FIELD);
  });

  it("never pulls the caret out of the field the buyer moved on to when the un-latch lands", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    directory.queue("settlements", [rowsReply([LVIV, KYIV])]);

    moveFocusTo(control(CITY_FIELD));
    moveFocusTo(control(TELEPHONE_FIELD));
    await settle();

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(document.activeElement?.id).toBe(TELEPHONE_FIELD);
  });

  it("does not take the field back on an empty answer, because an address matching nothing is not proof the directory is up", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(false);

    directory.queue("settlements", [rowsReply([])]);

    moveFocusTo(control(CITY_FIELD));
    moveFocusTo(control(TELEPHONE_FIELD));
    await settle();

    expect(isCombobox(CITY_FIELD)).toBe(false);
    expect(
      screen.getByText(UK_DICTIONARY.cart.np_fallback_hint).textContent
    ).toBe(UK_DICTIONARY.cart.np_fallback_hint);
  });

  it("gives the warehouse field its live list back when the buyer picks a settlement the directory does answer", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    directory.queue("warehouses", [{ status: UNAVAILABLE_STATUS }]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);

    directory.queue("warehouses", [rowsReply(BRANCH_ROWS)]);
    await pickCity(KYIV_QUERY, [KYIV]);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(isCombobox(WAREHOUSE_FIELD)).toBe(true);
    expect(document.activeElement).toBe(control(CITY_FIELD));
  });

  it("still posts the order after the directory fell over, as a manual branch delivery carrying no warehouse number", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    fillContact();
    await searchIn(CITY_FIELD, LVIV_QUERY);

    typeInto(CITY_FIELD, MANUAL_CITY);
    typeInto(WAREHOUSE_FIELD, MANUAL_WAREHOUSE);

    await submit();

    expect(readOrderGroup("delivery")).toEqual({
      mode: "np_branch",
      source: "manual",
      city: MANUAL_CITY,
      warehouse: MANUAL_WAREHOUSE,
    });
    expect(readOrderGroup("customer").phone).toBe(NORMALIZED_PHONE);
    expect(readOrderPayload().locale).toBe("uk");
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });

  it("lets the shopper type a warehouse and place the order when the carrier knows no such settlement, because a village the directory has never heard of is still a real address", async () => {
    renderCheckout();
    fillContact();

    directory.queue("settlements", [rowsReply([])]);
    await searchIn(CITY_FIELD, UNLISTED_SETTLEMENT);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(control(WAREHOUSE_FIELD).disabled).toBe(false);

    typeInto(WAREHOUSE_FIELD, TYPED_WAREHOUSE);
    await submit();

    expect(readOrderGroup("delivery")).toEqual({
      mode: "np_branch",
      source: "manual",
      city: UNLISTED_SETTLEMENT,
      warehouse: TYPED_WAREHOUSE,
    });
  });

  it("lets the shopper finish the order while our own limiter is throttling the settlement search, so a rate limit never becomes a locked form", async () => {
    renderCheckout();
    fillContact();

    directory.queue("settlements", [{ status: THROTTLED_STATUS }]);
    await searchIn(CITY_FIELD, UNLISTED_SETTLEMENT);

    expect(control(WAREHOUSE_FIELD).disabled).toBe(false);

    typeInto(WAREHOUSE_FIELD, TYPED_WAREHOUSE);
    await submit();

    expect(readOrderGroup("delivery")).toEqual({
      mode: "np_branch",
      source: "manual",
      city: UNLISTED_SETTLEMENT,
      warehouse: TYPED_WAREHOUSE,
    });
  });

  it("posts the directory source and the branch number when the shopper picked both from the live list", async () => {
    renderCheckout();
    fillContact();
    await pickCity(LVIV_QUERY, [LVIV]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();
    pickRow(WAREHOUSE_FIELD, FIRST_ROW);

    await submit();

    expect(readOrderGroup("delivery")).toEqual({
      mode: "np_branch",
      source: "np_directory",
      city: `${LVIV.label}, ${LVIV.region}`,
      warehouse: BRANCH_ROWS[FIRST_ROW].label,
      warehouse_number: BRANCH_ROWS[FIRST_ROW].number,
    });
  });
});

describe("the requests a buyer leaves behind", () => {
  it("drops the answer to a query the buyer has already erased, instead of repopulating the panel under one letter", async () => {
    renderCheckout();
    directory.queue("settlements", [heldReply([KYIV])]);

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, KYIV_QUERY);
    await settle();

    expect(directory.heldCount()).toBe(ONE_REQUEST);

    typeInto(CITY_FIELD, ONE_LETTER_QUERY);
    await settle();

    directory.release();
    await settle();

    expect(screen.queryByText(KYIV.label)).toBeNull();
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
    expect(control(CITY_FIELD).value).toBe(ONE_LETTER_QUERY);
  });

  it("never lets the failure of a query the buyer erased turn the fields into free text", async () => {
    renderCheckout();
    directory.queue("settlements", [heldFailure(UNAVAILABLE_STATUS)]);

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, KYIV_QUERY);
    await settle();

    typeInto(CITY_FIELD, ONE_LETTER_QUERY);
    await settle();

    directory.release();
    await settle();

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("keeps the answer to the latest settlement search when an older one lands after it", async () => {
    renderCheckout();
    directory.queue("settlements", [
      heldPastAbort([LVIV]),
      rowsReply([KYIV, LOCKERLESS_VILLAGE]),
    ]);

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, LVIV_QUERY);
    await settle();

    typeInto(CITY_FIELD, KYIV_QUERY);
    await settle();

    expect(rowsIn(CITY_FIELD).map((row) => row.textContent)).toEqual([
      `${KYIV.label}${KYIV.region}`,
      `${LOCKERLESS_VILLAGE.label}${LOCKERLESS_VILLAGE.region}`,
    ]);

    directory.release();
    await settle();

    expect(rowsIn(CITY_FIELD).map((row) => row.textContent)).toEqual([
      `${KYIV.label}${KYIV.region}`,
      `${LOCKERLESS_VILLAGE.label}${LOCKERLESS_VILLAGE.region}`,
    ]);
  });

  it("keeps the answer to the latest warehouse search when an older one lands after it", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    directory.queue("warehouses", [
      heldPastAbort(POSTOMAT_ROWS),
      rowsReply(BRANCH_ROWS),
    ]);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    typeInto(WAREHOUSE_FIELD, BRANCH_ROWS[FIRST_ROW].number);
    await settle();

    expect(rowsIn(WAREHOUSE_FIELD).map((row) => row.textContent)).toEqual(
      BRANCH_ROWS.map((row) => row.label)
    );

    directory.release();
    await settle();

    expect(rowsIn(WAREHOUSE_FIELD).map((row) => row.textContent)).toEqual(
      BRANCH_ROWS.map((row) => row.label)
    );
  });

  it("aborts the search still in flight when the buyer leaves the checkout", async () => {
    const view = renderCheckout();

    directory.queue("settlements", [heldReply([LVIV])]);

    moveFocusTo(control(CITY_FIELD));
    typeInto(CITY_FIELD, LVIV_QUERY);
    await settle();

    const [signal] = directory.signalsTo("settlements");

    expect(signal.aborted).toBe(false);

    view.unmount();

    expect(signal.aborted).toBe(true);
  });
});

describe("the two warehouse categories the carrier numbers apart", () => {
  it("names the field after the category the chip selects, so a locker is never labelled a branch", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    expect(screen.getByLabelText(`${UK_DICTIONARY.cart.np_branch} *`)).toBe(
      control(WAREHOUSE_FIELD)
    );

    fireEvent.click(methodChip(UK_DICTIONARY.cart.method_postomat));

    expect(screen.getByLabelText(`${UK_DICTIONARY.cart.np_postomat} *`)).toBe(
      control(WAREHOUSE_FIELD)
    );
  });
});

describe("the settlement rows the carrier may hand one city ref", () => {
  it("resolves the row the buyer clicked and not the first row sharing its ref", async () => {
    renderCheckout();
    fillContact();
    directory.queue("settlements", [rowsReply([LVIV, LVIV_TWIN])]);

    await searchIn(CITY_FIELD, LVIV_QUERY);
    pickRow(CITY_FIELD, SECOND_ROW);
    typeInto(WAREHOUSE_FIELD, MANUAL_WAREHOUSE);

    await submit();

    expect(readOrderGroup("delivery").city).toBe(
      `${LVIV_TWIN.label}, ${LVIV_TWIN.region}`
    );
    expect(control(CITY_FIELD).value).toBe(LVIV_TWIN.label);
  });
});

describe("the fallback hint, which a screen reader has to hear", () => {
  it("keeps its live region mounted before there is anything to announce", () => {
    renderCheckout();

    const region = document.getElementById(HINT_ID);

    expect(region?.getAttribute("aria-live")).toBe("polite");
    expect(region?.textContent).toBe(EMPTY_TEXT);
  });

  it("describes both free-text fields it explains once the directory falls over", async () => {
    renderCheckout();
    directory.queue("settlements", [{ status: UNAVAILABLE_STATUS }]);

    await searchIn(CITY_FIELD, LVIV_QUERY);

    const region = screen.getByText(UK_DICTIONARY.cart.np_fallback_hint);

    expect(region.id).toBe(HINT_ID);
    expect(control(CITY_FIELD).getAttribute("aria-describedby")).toContain(
      HINT_ID
    );
    expect(control(WAREHOUSE_FIELD).getAttribute("aria-describedby")).toContain(
      HINT_ID
    );
  });
});
