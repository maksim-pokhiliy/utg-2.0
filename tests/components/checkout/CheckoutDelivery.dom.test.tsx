import { act, fireEvent, screen, within } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import { CheckoutForm } from "@root/components/checkout/CheckoutForm";
import {
  composeCartLine,
  useCartStore,
  type ICartItem,
} from "@root/store/cart";

import {
  EN_DICTIONARY,
  UK_DICTIONARY,
  renderWithI18n,
} from "../../support/renderWithI18n";

type FetchMock = Mock<typeof fetch>;

type I18nOptions = NonNullable<Parameters<typeof renderWithI18n>[1]>;

interface HarnessProps {
  onPlaced: () => void;
}

interface DirectoryReply {
  status: number;
  body?: unknown;
}

const DEBOUNCE_MS = 250;

const OK_STATUS = 200;

const THROTTLED_STATUS = 429;

const UNLISTED_SETTLEMENT = "Іванівка";

const TYPED_WAREHOUSE = "Відділення №2 біля школи";

const UNAVAILABLE_STATUS = 503;

const ORDER_ROUTE = "/api/place_order";

const SETTLEMENTS_ROUTE = "/api/np/settlements";

const WAREHOUSES_ROUTE = "/api/np/warehouses";

const BRANCH_PARAM = "method=branch";

const POSTOMAT_PARAM = "method=postomat";

const JSON_HEADERS = { "Content-Type": "application/json" };

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

const toResponse = ({ status, body }: DirectoryReply): Response =>
  body === undefined
    ? new Response(null, { status })
    : new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const rowsBody = (items: readonly unknown[]): DirectoryReply => ({
  status: OK_STATUS,
  body: { items },
});

const takeReply = (queue: DirectoryReply[]): DirectoryReply => {
  const reply = queue.length > 1 ? queue.shift() : queue[0];

  return reply ?? { status: UNAVAILABLE_STATUS };
};

let settlementReplies: DirectoryReply[] = [];

let warehouseReplies: DirectoryReply[] = [];

const createFetchMock = (): FetchMock =>
  vi.fn<typeof fetch>((input) => {
    const url = String(input);

    if (url.startsWith(SETTLEMENTS_ROUTE)) {
      return Promise.resolve(toResponse(takeReply(settlementReplies)));
    }

    if (url.startsWith(WAREHOUSES_ROUTE)) {
      return Promise.resolve(toResponse(takeReply(warehouseReplies)));
    }

    return Promise.resolve(new Response(null, { status: OK_STATUS }));
  });

let fetchMock = createFetchMock();

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

const callsTo = (route: string): string[] =>
  fetchMock.mock.calls
    .map(([input]) => String(input))
    .filter((url) => url.startsWith(route));

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
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
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
  settlementReplies = [rowsBody(settlements)];
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
  const call = fetchMock.mock.calls.find(
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
  settlementReplies = [rowsBody([LVIV, KYIV])];
  warehouseReplies = [rowsBody(BRANCH_ROWS)];
  fetchMock = createFetchMock();
  onPlaced = vi.fn<() => void>();
  vi.stubGlobal("fetch", fetchMock);
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

    expect(callsTo(WAREHOUSES_ROUTE)).toHaveLength(1);
    expect(callsTo(WAREHOUSES_ROUTE)[0]).toContain(BRANCH_PARAM);

    warehouseReplies = [rowsBody(POSTOMAT_ROWS)];

    const postomat = methodChip(UK_DICTIONARY.cart.method_postomat);

    fireEvent.click(postomat);
    moveFocusTo(postomat);
    await settle();

    expect(callsTo(WAREHOUSES_ROUTE)).toHaveLength(1);

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(callsTo(WAREHOUSES_ROUTE)).toHaveLength(2);
    expect(callsTo(WAREHOUSES_ROUTE)[1]).toContain(POSTOMAT_PARAM);
    expect(rowsIn(WAREHOUSE_FIELD).map((row) => row.textContent)).toEqual(
      POSTOMAT_ROWS.map((row) => row.label)
    );
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

    expect(callsTo(SETTLEMENTS_ROUTE)).toHaveLength(0);
    expect(barsIn(CITY_FIELD)).toBe(0);
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
  });

  it("lowers them without asking the carrier again when the field is returned to on the settlement already chosen", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);

    expect(callsTo(SETTLEMENTS_ROUTE)).toHaveLength(1);

    moveFocusTo(control(TELEPHONE_FIELD));
    moveFocusTo(control(CITY_FIELD));

    expect(barsIn(CITY_FIELD)).toBeGreaterThan(0);

    await settle();

    expect(callsTo(SETTLEMENTS_ROUTE)).toHaveLength(1);
    expect(barsIn(CITY_FIELD)).toBe(0);
  });

  it("lowers them when our own limiter answers 429, so a throttled field never spins forever", async () => {
    renderCheckout();
    settlementReplies = [{ status: THROTTLED_STATUS }];

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(barsIn(CITY_FIELD)).toBe(0);
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
  });
});

describe("the fallback machine, which no directory failure may leave a volunteer stuck behind", () => {
  it("turns the settlement field into a plain text input on a 503, keeping the typed characters, the focus and the caret at their end", async () => {
    renderCheckout();
    settlementReplies = [{ status: UNAVAILABLE_STATUS }];

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
    settlementReplies = [{ status: UNAVAILABLE_STATUS }];

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
    settlementReplies = [rowsBody([])];

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(screen.getByText(UK_DICTIONARY.cart.np_empty).textContent).toBe(
      UK_DICTIONARY.cart.np_empty
    );
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("keeps the combobox on a 429, because our own rate limit is not the carrier going down", async () => {
    renderCheckout();
    settlementReplies = [{ status: THROTTLED_STATUS }];

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(screen.queryByText(UK_DICTIONARY.cart.np_fallback_hint)).toBeNull();
  });

  it("leaves the settlement combobox live when only the warehouse lookup falls over", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    warehouseReplies = [{ status: UNAVAILABLE_STATUS }];

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);
    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(
      screen.getByText(UK_DICTIONARY.cart.np_fallback_hint_warehouse)
        .textContent
    ).toBe(UK_DICTIONARY.cart.np_fallback_hint_warehouse);
  });

  it("never restores the settlement combobox once it has fallen back, however healthy the carrier turns", async () => {
    renderCheckout();
    settlementReplies = [
      { status: UNAVAILABLE_STATUS },
      rowsBody([LVIV, KYIV]),
    ];

    await searchIn(CITY_FIELD, LVIV_QUERY);

    expect(isCombobox(CITY_FIELD)).toBe(false);

    typeInto(CITY_FIELD, KYIV_QUERY);
    await settle();
    await settle();

    expect(callsTo(SETTLEMENTS_ROUTE)).toHaveLength(1);
    expect(isCombobox(CITY_FIELD)).toBe(false);
    expect(control(CITY_FIELD).value).toBe(KYIV_QUERY);
  });

  it("never restores the warehouse combobox either, not even when a later settlement search succeeds", async () => {
    renderCheckout();
    await pickCity(LVIV_QUERY, [LVIV]);
    warehouseReplies = [{ status: UNAVAILABLE_STATUS }];

    moveFocusTo(control(WAREHOUSE_FIELD));
    await settle();

    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);

    await pickCity(KYIV_QUERY, [KYIV]);

    expect(callsTo(SETTLEMENTS_ROUTE)).toHaveLength(2);
    expect(isCombobox(CITY_FIELD)).toBe(true);
    expect(isCombobox(WAREHOUSE_FIELD)).toBe(false);
  });

  it("still posts the order after the directory fell over, as a manual branch delivery carrying no warehouse number", async () => {
    renderCheckout();
    settlementReplies = [{ status: UNAVAILABLE_STATUS }];

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

    settlementReplies = [rowsBody([])];
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

    settlementReplies = [{ status: THROTTLED_STATUS }];
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
