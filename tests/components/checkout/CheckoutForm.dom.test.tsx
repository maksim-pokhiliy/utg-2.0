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
import type { CheckoutFieldName } from "@root/components/checkout/fields";
import type { Dictionary } from "@root/i18n";
import {
  composeCartLine,
  useCartStore,
  type ICartItem,
} from "@root/store/cart";

import {
  EN_DICTIONARY,
  UAH_MONEY,
  UK_DICTIONARY,
  USD_MONEY,
  renderWithI18n,
} from "../../support/renderWithI18n";

type FetchMock = Mock<typeof fetch>;

type FetchInput = Parameters<typeof fetch>[0];

type FetchInit = Parameters<typeof fetch>[1];

type I18nOptions = NonNullable<Parameters<typeof renderWithI18n>[1]>;

type OrderReply = () => Promise<Response>;

interface CapturedRequest {
  url: FetchInput;
  init: FetchInit;
}

interface HarnessProps {
  onPlaced: () => void;
}

const ORDER_ROUTE = "/api/place_order";

const DIRECTORY_PREFIX = "/api/np/";

const DEBOUNCE_MS = 250;

const TOAST_MOUNT_MS = 0;

const OK_STATUS = 200;

const SERVICE_UNAVAILABLE_STATUS = 503;

const REQUIRED_MARKER = " *";

const JSON_HEADERS = { "Content-Type": "application/json" };

const OPTION_SELECTOR = '[role="option"]';

const NETWORK_FAILURE = "network down";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const TYPED_UK_PHONE = "067 123 45 67";

const NORMALIZED_UK_PHONE = "+380671234567";

const TYPED_INTERNATIONAL_PHONE = "+1 202 555 0123";

const MALFORMED_PHONE = "12345";

const COMMENT = "Подзвоніть після 18:00";

const SETTLEMENT = {
  ref: "lviv-ref",
  label: "Львів",
  region: "Львівська обл.",
  warehouseCount: 312,
  isCourierAllowed: true,
};

const SETTLEMENT_QUERY = "Льв";

const EXPECTED_DELIVERY_CITY = `${SETTLEMENT.label}, ${SETTLEMENT.region}`;

const VALUES: Record<CheckoutFieldName, string> = {
  last_name: "Шевченко",
  first_name: "Марія",
  patronymic: "Тарасівна",
  telephone: TYPED_UK_PHONE,
  country: "Україна",
  state: "Львівська область",
  city: "Львів",
  address: "Вулиця Казкового Міста 1",
  np_city: SETTLEMENT.label,
  np_warehouse: "Відділення №5: вул. Хрещатик, 1",
  street: "Вулиця Казкового Міста",
  building: "1",
  apartment: "7",
  comment: COMMENT,
};

const LABEL_KEYS = {
  last_name: "last_name",
  first_name: "first_name",
  patronymic: "patronymic",
  telephone: "telephone",
  country: "country",
  state: "state",
  city: "city",
  address: "address",
  np_city: "city",
  np_warehouse: "np_branch",
  street: "street",
  building: "building",
  apartment: "apartment",
  comment: "comment",
} as const satisfies Record<CheckoutFieldName, keyof Dictionary["cart"]>;

const UK_REQUIRED_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "np_city",
  "np_warehouse",
];

const EN_REQUIRED_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "country",
  "city",
  "address",
];

const UK_OPTIONAL_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "patronymic",
  "comment",
];

const EN_OPTIONAL_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "state",
  "comment",
];

const OPTIONAL_FIELD_NAMES: readonly CheckoutFieldName[] = [
  ...UK_OPTIONAL_FIELD_NAMES,
  ...EN_OPTIONAL_FIELD_NAMES,
];

const UK_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "patronymic",
  "telephone",
  "np_city",
  "np_warehouse",
  "comment",
];

const SIZED_LINE: ICartItem = composeCartLine({
  slug: "death-black",
  title: "«Death» Чорна",
  size: "L",
  price: 1000,
  quantity: 2,
  image: "/images/products/BLACK.jpg",
  productUrl:
    "https://www.ua-tactical-gear.com/uk/category/tshirts/death-black",
});

const SIZELESS_LINE: ICartItem = composeCartLine({
  slug: "waiting",
  title: "«Waiting»",
  size: null,
  price: 300,
  quantity: 1,
  image: "/images/products/patches_waiting.jpg",
  productUrl: "https://www.ua-tactical-gear.com/uk/category/patches/waiting",
});

const CART_LINES: readonly ICartItem[] = [SIZED_LINE, SIZELESS_LINE];

const SUBTOTAL_UAH = 2300;

const EXPECTED_UAH_TOTAL = "2300.00";

const withPadding = (value: string): string => `  ${value}  `;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const respondWith = (status: number): Response =>
  new Response(null, { status });

const settlementsResponse = (): Response =>
  new Response(JSON.stringify({ items: [SETTLEMENT] }), {
    status: OK_STATUS,
    headers: JSON_HEADERS,
  });

const acceptOrder: OrderReply = () => Promise.resolve(respondWith(OK_STATUS));

const refuseOrder: OrderReply = () =>
  Promise.resolve(respondWith(SERVICE_UNAVAILABLE_STATUS));

const failOrder: OrderReply = () => Promise.reject(new Error(NETWORK_FAILURE));

let orderReplies: OrderReply[] = [acceptOrder];

const answerOrderWith = (...replies: readonly OrderReply[]): void => {
  orderReplies = [...replies];
};

const takeOrderReply = (): OrderReply => {
  const reply =
    orderReplies.length > 1 ? orderReplies.shift() : orderReplies[0];

  return reply ?? acceptOrder;
};

const createFetchMock = (): FetchMock =>
  vi.fn<typeof fetch>((input) =>
    String(input).startsWith(DIRECTORY_PREFIX)
      ? Promise.resolve(settlementsResponse())
      : takeOrderReply()()
  );

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

const renderForm = (options: I18nOptions = {}) =>
  renderWithI18n(<PendingHarness onPlaced={onPlaced} />, options);

const renderEnglishForm = () =>
  renderForm({ locale: "en", dictionary: EN_DICTIONARY });

const requiredLabel = (label: string): string => `${label}${REQUIRED_MARKER}`;

const labelFor = (name: CheckoutFieldName, dictionary: Dictionary): string => {
  const label = dictionary.cart[LABEL_KEYS[name]];

  return OPTIONAL_FIELD_NAMES.includes(name) ? label : requiredLabel(label);
};

const fieldFor = (
  name: CheckoutFieldName,
  dictionary: Dictionary = UK_DICTIONARY
): HTMLElement => screen.getByLabelText(labelFor(name, dictionary));

const typeInto = (
  name: CheckoutFieldName,
  value: string,
  dictionary: Dictionary = UK_DICTIONARY
): void => {
  fireEvent.change(fieldFor(name, dictionary), { target: { value } });
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
  });
};

const flushToast = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TOAST_MOUNT_MS);
  });
};

const chooseSettlement = async (): Promise<void> => {
  const city = fieldFor("np_city");

  act(() => {
    city.focus();
  });
  fireEvent.change(city, { target: { value: SETTLEMENT_QUERY } });
  await settle();

  const row = document
    .getElementById("np_city-listbox")
    ?.querySelector(OPTION_SELECTOR);

  if (row === null || row === undefined) {
    throw new Error("The settlement list offered no row to pick");
  }

  fireEvent.mouseDown(row);
};

const fillUkRequiredFields = async (
  phone: string = TYPED_UK_PHONE
): Promise<void> => {
  typeInto("last_name", withPadding(VALUES.last_name));
  typeInto("first_name", withPadding(VALUES.first_name));
  typeInto("telephone", withPadding(phone));
  await chooseSettlement();
  typeInto("np_warehouse", withPadding(VALUES.np_warehouse));
};

const fillEnRequiredFields = (
  phone: string = TYPED_INTERNATIONAL_PHONE
): void => {
  for (const name of EN_REQUIRED_FIELD_NAMES) {
    const value = name === "telephone" ? phone : VALUES[name];

    typeInto(name, withPadding(value), EN_DICTIONARY);
  }
};

const errorFor = (name: CheckoutFieldName): string | null => {
  const alert = document.getElementById(`${name}-error`);

  return alert === null ? null : alert.textContent;
};

const alertTexts = (): (string | null)[] =>
  screen.queryAllByRole("alert").map((alert) => alert.textContent);

const submitButton = (
  dictionary: Dictionary = UK_DICTIONARY
): HTMLButtonElement => {
  const control = screen.getByRole("button", {
    name: dictionary.cart.place_order,
  });

  if (!(control instanceof HTMLButtonElement)) {
    throw new Error("The place-order control is not a button element");
  }

  return control;
};

const getForm = (container: HTMLElement): HTMLFormElement => {
  const form = container.querySelector("form");

  if (form === null) {
    throw new Error("The checkout form is not rendered");
  }

  return form;
};

const channelGroup = (): HTMLElement =>
  screen.getByRole("radiogroup", {
    name: (accessibleName: string) =>
      accessibleName.startsWith(UK_DICTIONARY.cart.contact_channel),
  });

const channelChips = (): HTMLElement[] =>
  within(channelGroup()).getAllByRole("radio");

const channelChip = (label: string): HTMLElement =>
  within(channelGroup()).getByRole("radio", { name: label });

const everyChip = (): HTMLElement[] => screen.getAllByRole("radio");

const isDisabled = (element: Element): boolean =>
  element.hasAttribute("disabled");

const submit = async (
  dictionary: Dictionary = UK_DICTIONARY
): Promise<void> => {
  await act(async () => {
    fireEvent.click(submitButton(dictionary));
  });
};

const placeOrder = async (): Promise<void> => {
  renderForm();
  await fillUkRequiredFields();
  await submit();
};

const deferNextOrder = (): ((response: Response) => void) => {
  let settleOrder: (response: Response) => void = () => undefined;

  answerOrderWith(
    () =>
      new Promise<Response>((resolve) => {
        settleOrder = resolve;
      })
  );

  return (response) => {
    settleOrder(response);
  };
};

const orderCalls = (): CapturedRequest[] =>
  fetchMock.mock.calls
    .filter(([input]) => String(input) === ORDER_ROUTE)
    .map(([url, init]) => ({ url, init }));

const readRequest = (index = 0): CapturedRequest => {
  const call = orderCalls().at(index);

  if (call === undefined) {
    throw new Error(`The checkout form issued no order number ${index + 1}`);
  }

  return call;
};

const readPayload = (index = 0): Record<string, unknown> => {
  const { init } = readRequest(index);
  const body = init?.body;

  if (typeof body !== "string") {
    throw new Error("The checkout request carried no JSON string body");
  }

  const parsed: unknown = JSON.parse(body);

  if (!isRecord(parsed)) {
    throw new Error("The checkout request body is not a JSON object");
  }

  return parsed;
};

const readGroup = (key: string, index = 0): Record<string, unknown> => {
  const group = readPayload(index)[key];

  if (!isRecord(group)) {
    throw new Error(`The checkout payload carries no ${key} object`);
  }

  return group;
};

const readKey = (index = 0): string => {
  const key = readPayload(index).idempotency_key;

  if (typeof key !== "string") {
    throw new Error("The checkout request carried no idempotency key");
  }

  return key;
};

const readCartLines = (): Record<string, unknown>[] => {
  const { cart } = readPayload();

  if (!Array.isArray(cart)) {
    throw new Error("The checkout payload carries no cart array");
  }

  return cart.map((line: unknown) => {
    if (!isRecord(line)) {
      throw new Error("A cart line in the checkout payload is not an object");
    }

    return line;
  });
};

Element.prototype.scrollIntoView = function scrollIntoView(): void {};

beforeEach(() => {
  vi.useFakeTimers();
  useCartStore.setState({ items: [...CART_LINES] });
  answerOrderWith(acceptOrder);
  fetchMock = createFetchMock();
  onPlaced = vi.fn<() => void>();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CheckoutForm validation", () => {
  it("issues no order when an empty form is submitted", async () => {
    renderForm();

    await submit();

    expect(orderCalls()).toHaveLength(0);
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("reports an error on each of the five required uk fields and on neither of the two optional ones", async () => {
    renderForm();

    await submit();

    expect(alertTexts()).toEqual(
      UK_REQUIRED_FIELD_NAMES.map(() => UK_DICTIONARY.cart.required)
    );

    for (const name of UK_OPTIONAL_FIELD_NAMES) {
      expect(errorFor(name), name).toBeNull();
      expect(fieldFor(name).getAttribute("aria-invalid"), name).not.toBe(
        "true"
      );
    }
  });

  it("reports an error on each of the six required en fields and on neither of the two optional ones", async () => {
    renderEnglishForm();

    await submit(EN_DICTIONARY);

    expect(alertTexts()).toEqual(
      EN_REQUIRED_FIELD_NAMES.map(() => EN_DICTIONARY.cart.required)
    );

    for (const name of EN_OPTIONAL_FIELD_NAMES) {
      expect(errorFor(name), name).toBeNull();
    }
  });

  it("moves focus to the last name field, which the ratified UA order renders first", async () => {
    renderForm();

    await submit();

    expect(document.activeElement).toBe(fieldFor("last_name"));
  });

  it("drops the error on a field as soon as it is corrected", async () => {
    renderForm();

    await submit();

    expect(errorFor("first_name")).toBe(UK_DICTIONARY.cart.required);

    typeInto("first_name", VALUES.first_name);

    expect(errorFor("first_name")).toBeNull();
    expect(errorFor("last_name")).toBe(UK_DICTIONARY.cart.required);
  });

  it("treats a whitespace-only settlement as missing, however the directory filled it before", async () => {
    renderForm();
    await fillUkRequiredFields();
    typeInto("np_city", "   ");

    await submit();

    expect(orderCalls()).toHaveLength(0);
    expect(errorFor("np_city")).toBe(UK_DICTIONARY.cart.required);
    expect(document.activeElement).toBe(fieldFor("np_city"));
  });

  it("calls an empty phone required, because nothing was typed there yet", async () => {
    renderForm();

    await submit();

    expect(errorFor("telephone")).toBe(UK_DICTIONARY.cart.required);
  });

  it("calls a filled but malformed phone badly formatted and never required, so the shopper is not told to fill a field they filled", async () => {
    renderForm();
    await fillUkRequiredFields();
    typeInto("telephone", MALFORMED_PHONE);

    await submit();

    expect(errorFor("telephone")).toBe(UK_DICTIONARY.cart.phone_invalid);
    expect(alertTexts()).toEqual([UK_DICTIONARY.cart.phone_invalid]);
    expect(document.activeElement).toBe(fieldFor("telephone"));
  });

  it("issues no order when the phone is the only malformed value", async () => {
    renderForm();
    await fillUkRequiredFields();
    typeInto("telephone", MALFORMED_PHONE);

    await submit();

    expect(orderCalls()).toHaveLength(0);
    expect(onPlaced).not.toHaveBeenCalled();
  });
});

describe("CheckoutForm recipient and contact fields", () => {
  it("renders the patronymic field under uk, where the operator addresses people by it", () => {
    renderForm();

    expect(fieldFor("patronymic")).toBeInstanceOf(HTMLInputElement);
  });

  it("renders no patronymic field under en, where the name has no such part", () => {
    renderEnglishForm();

    expect(
      screen.queryByLabelText(labelFor("patronymic", EN_DICTIONARY))
    ).toBeNull();
    expect(
      screen.queryByLabelText(labelFor("patronymic", UK_DICTIONARY))
    ).toBeNull();
  });

  it("sends the trimmed patronymic the shopper filled in", async () => {
    renderForm();
    await fillUkRequiredFields();
    typeInto("patronymic", withPadding(VALUES.patronymic));

    await submit();

    expect(readGroup("customer").patronymic).toBe(VALUES.patronymic);
  });

  it("omits the patronymic from the payload when the shopper left it blank", async () => {
    await placeOrder();

    expect(readGroup("customer")).not.toHaveProperty("patronymic");
  });

  it("preselects the call channel, so a shopper who never touches the group still names a reachable one", () => {
    renderForm();

    expect(
      channelChip(UK_DICTIONARY.cart.channel_call).getAttribute("aria-checked")
    ).toBe("true");
  });

  it("marks the channel group required and keeps exactly one chip checked at a time", () => {
    renderForm();

    const group = channelGroup();

    expect(group.getAttribute("aria-required")).toBe("true");
    expect(channelChips()).toHaveLength(3);
    expect(within(group).getAllByRole("radio", { checked: true })).toHaveLength(
      1
    );

    fireEvent.click(channelChip(UK_DICTIONARY.cart.channel_telegram));

    expect(within(group).getAllByRole("radio", { checked: true })).toHaveLength(
      1
    );
    expect(
      channelChip(UK_DICTIONARY.cart.channel_telegram).getAttribute(
        "aria-checked"
      )
    ).toBe("true");
  });

  it("sends the default call channel when the shopper picks none", async () => {
    await placeOrder();

    expect(readGroup("customer").contact_channel).toBe("call");
  });

  it("sends the channel the shopper picked instead of the default", async () => {
    renderForm();
    await fillUkRequiredFields();
    fireEvent.click(channelChip(UK_DICTIONARY.cart.channel_telegram));

    await submit();

    expect(readGroup("customer").contact_channel).toBe("telegram");
  });

  it("sends the phone normalized, never as the shopper typed it", async () => {
    await placeOrder();

    expect(readGroup("customer").phone).toBe(NORMALIZED_UK_PHONE);
  });
});

describe("CheckoutForm order payload — the v2 envelope the relay forwards", () => {
  it("posts version 2 and nothing the shopper left untouched", async () => {
    await placeOrder();

    expect(readPayload().version).toBe(2);
    expect(Object.keys(readPayload()).sort()).toEqual([
      "cart",
      "currency",
      "customer",
      "delivery",
      "idempotency_key",
      "locale",
      "total",
      "version",
    ]);
  });

  it("groups the recipient under customer rather than at the envelope root", async () => {
    await placeOrder();

    expect(readGroup("customer")).toEqual({
      first_name: VALUES.first_name,
      last_name: VALUES.last_name,
      phone: NORMALIZED_UK_PHONE,
      contact_channel: "call",
    });
  });

  it("declares the branch mode under uk, now that the carrier directory answers the form", async () => {
    await placeOrder();

    expect(readGroup("delivery")).toEqual({
      mode: "np_branch",
      source: "manual",
      city: EXPECTED_DELIVERY_CITY,
      warehouse: VALUES.np_warehouse,
    });
  });

  it("declares the delivery mode generic under en, the locale the carrier does not serve", async () => {
    renderEnglishForm();
    fillEnRequiredFields();

    await submit(EN_DICTIONARY);

    expect(readGroup("delivery")).toEqual({
      mode: "generic",
      country: VALUES.country,
      city: VALUES.city,
      address: VALUES.address,
    });
  });

  it("sends the trimmed region when the en shopper filled it in", async () => {
    renderEnglishForm();
    fillEnRequiredFields();
    typeInto("state", withPadding(VALUES.state), EN_DICTIONARY);

    await submit(EN_DICTIONARY);

    expect(readGroup("delivery").state).toBe(VALUES.state);
  });

  it("sends the trimmed comment the shopper typed", async () => {
    renderForm();
    await fillUkRequiredFields();
    typeInto("comment", withPadding(COMMENT));

    await submit();

    expect(readPayload().comment).toBe(COMMENT);
  });

  it("omits the comment entirely when the shopper never touched it", async () => {
    await placeOrder();

    expect(readPayload()).not.toHaveProperty("comment");
  });

  it("sends every cart line with the exact key set the relay forwards", async () => {
    await placeOrder();

    const lines = readCartLines();

    expect(lines).toHaveLength(CART_LINES.length);

    for (const line of lines) {
      expect(Object.keys(line).sort()).toEqual([
        "id",
        "image",
        "price",
        "productUrl",
        "quantity",
        "title",
      ]);
    }
  });

  it("sends the title, quantity and product URL the bot prints for every cart line", async () => {
    await placeOrder();

    const lines = readCartLines();

    CART_LINES.forEach((expected, index) => {
      const line = lines[index];

      expect(line.title, expected.id).toBe(expected.title);
      expect(line.quantity, expected.id).toBe(expected.quantity);
      expect(line.productUrl, expected.id).toBe(expected.productUrl);
    });
  });

  it("carries the chosen size inside the title of a sized line", async () => {
    await placeOrder();

    const [sizedLine] = readCartLines();

    expect(sizedLine.title).toBe("«Death» Чорна · L");
  });

  it("sends the total as a string at display-currency magnitude", async () => {
    await placeOrder();

    const { total } = readPayload();

    expect(typeof total).toBe("string");
    expect(total).toBe(EXPECTED_UAH_TOTAL);
    expect(total).toBe((SUBTOTAL_UAH * UAH_MONEY.coefficient).toFixed(2));
  });

  it("sends the currency and the locale the i18n provider resolved", async () => {
    await placeOrder();

    const payload = readPayload();

    expect(payload.currency).toBe(UAH_MONEY.currency);
    expect(payload.locale).toBe("uk");
  });

  it("converts the total with the coefficient of the display currency", async () => {
    renderForm({
      locale: "en",
      dictionary: EN_DICTIONARY,
      money: USD_MONEY,
    });
    fillEnRequiredFields();

    await submit(EN_DICTIONARY);

    const payload = readPayload();

    expect(payload.currency).toBe(USD_MONEY.currency);
    expect(payload.total).toBe(
      (SUBTOTAL_UAH * USD_MONEY.coefficient).toFixed(2)
    );
  });

  it("states the currency explicitly, so an en order priced in UAH is never read as USD", async () => {
    renderForm({
      locale: "en",
      dictionary: EN_DICTIONARY,
      money: UAH_MONEY,
    });
    fillEnRequiredFields();

    await submit(EN_DICTIONARY);

    const payload = readPayload();

    expect(payload.locale).toBe("en");
    expect(payload.currency).toBe("UAH");
    expect(payload.total).toBe(EXPECTED_UAH_TOTAL);
  });
});

describe("CheckoutForm request", () => {
  it("posts to the order route without a trailing slash", async () => {
    await placeOrder();

    expect(readRequest().url).toBe(ORDER_ROUTE);
  });

  it("posts the payload as JSON", async () => {
    await placeOrder();

    const { init } = readRequest();

    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual(JSON_HEADERS);
  });

  it("reports success to the caller once when the relay accepts the order", async () => {
    await placeOrder();

    expect(orderCalls()).toHaveLength(1);
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutForm failure path", () => {
  it("does not report success when the relay is unconfigured and answers 503", async () => {
    answerOrderWith(refuseOrder);

    await placeOrder();

    expect(orderCalls()).toHaveLength(1);
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("leaves the cart untouched when the relay answers 503", async () => {
    answerOrderWith(refuseOrder);

    await placeOrder();

    expect(useCartStore.getState().items).toEqual([...CART_LINES]);
  });

  it("does not report success when the request itself fails", async () => {
    answerOrderWith(failOrder);

    await placeOrder();

    expect(onPlaced).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([...CART_LINES]);
  });

  it("raises the order error toast when the relay answers 503", async () => {
    answerOrderWith(refuseOrder);

    await placeOrder();
    await flushToast();

    expect(screen.getByText(UK_DICTIONARY.cart.order_error).textContent).toBe(
      UK_DICTIONARY.cart.order_error
    );
  });

  it("raises the order error toast when the request itself fails", async () => {
    answerOrderWith(failOrder);

    await placeOrder();
    await flushToast();

    expect(screen.getByText(UK_DICTIONARY.cart.order_error).textContent).toBe(
      UK_DICTIONARY.cart.order_error
    );
  });
});

describe("CheckoutForm idempotency key", () => {
  it("sends a canonical v4 uuid the relay can deduplicate on", async () => {
    await placeOrder();

    expect(readKey()).toMatch(UUID_V4);
  });

  it("repeats the same key when the shopper retries after a refusal, so a retry never reads as a second order", async () => {
    answerOrderWith(refuseOrder, failOrder);

    renderForm();
    await fillUkRequiredFields();
    await submit();
    await submit();

    expect(orderCalls()).toHaveLength(2);
    expect(onPlaced).not.toHaveBeenCalled();
    expect(readKey(1)).toBe(readKey(0));
  });

  it("mints a fresh key for the next order once one succeeded, so a real second order is never swallowed", async () => {
    renderForm();
    await fillUkRequiredFields();
    await submit();
    await submit();

    expect(orderCalls()).toHaveLength(2);
    expect(onPlaced).toHaveBeenCalledTimes(2);
    expect(readKey(1)).toMatch(UUID_V4);
    expect(readKey(1)).not.toBe(readKey(0));
  });

  it("places the order anyway when the platform offers no crypto source, dropping only the hint", async () => {
    renderForm();
    await fillUkRequiredFields();
    vi.stubGlobal("crypto", undefined);

    await submit();

    expect(readPayload()).not.toHaveProperty("idempotency_key");
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutForm in-flight guard", () => {
  it("disables the submit control and ignores a second submit while the request is in flight", async () => {
    const { container } = renderForm();

    await fillUkRequiredFields();

    const settleOrder = deferNextOrder();

    await submit();

    expect(submitButton().disabled).toBe(true);

    fireEvent.submit(getForm(container));

    expect(orderCalls()).toHaveLength(1);

    await act(async () => {
      settleOrder(respondWith(OK_STATUS));
    });

    expect(submitButton().disabled).toBe(false);
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });

  it("disables every field and every chip of both groups while the request is in flight, and releases them when it settles", async () => {
    renderForm();

    await fillUkRequiredFields();

    const settleOrder = deferNextOrder();

    await submit();

    for (const name of UK_FIELD_NAMES) {
      expect(isDisabled(fieldFor(name)), name).toBe(true);
    }

    expect(everyChip()).toHaveLength(6);

    for (const chip of everyChip()) {
      expect(isDisabled(chip), chip.textContent ?? "").toBe(true);
    }

    await act(async () => {
      settleOrder(respondWith(OK_STATUS));
    });

    for (const name of UK_FIELD_NAMES) {
      expect(isDisabled(fieldFor(name)), name).toBe(false);
    }

    for (const chip of everyChip()) {
      expect(isDisabled(chip), chip.textContent ?? "").toBe(false);
    }
  });
});
