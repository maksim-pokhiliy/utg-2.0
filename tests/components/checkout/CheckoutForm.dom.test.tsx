import { act, fireEvent, screen } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

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

interface CapturedRequest {
  url: FetchInput;
  init: FetchInit;
}

interface HarnessProps {
  onPlaced: () => void;
}

const OK_STATUS = 200;

const SERVICE_UNAVAILABLE_STATUS = 503;

const REQUIRED_MARKER = " *";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const TYPED_UK_PHONE = "067 123 45 67";

const NORMALIZED_UK_PHONE = "+380671234567";

const TYPED_INTERNATIONAL_PHONE = "+1 202 555 0123";

const MALFORMED_PHONE = "12345";

const COMMENT = "Подзвоніть після 18:00";

const VALUES: Record<CheckoutFieldName, string> = {
  last_name: "Шевченко",
  first_name: "Марія",
  patronymic: "Тарасівна",
  telephone: TYPED_UK_PHONE,
  country: "Україна",
  state: "Львівська область",
  city: "Львів",
  address: "Вулиця Казкового Міста 1",
  comment: COMMENT,
};

const REQUIRED_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "country",
  "city",
  "address",
];

const OPTIONAL_FIELD_NAMES: readonly CheckoutFieldName[] = [
  "patronymic",
  "state",
  "comment",
];

const UK_FIELD_NAMES: readonly CheckoutFieldName[] = [
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

const createFetchMock = (): FetchMock =>
  vi.fn<typeof fetch>(() => Promise.resolve(respondWith(OK_STATUS)));

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

const requiredLabel = (label: string): string => `${label}${REQUIRED_MARKER}`;

const labelFor = (name: CheckoutFieldName, dictionary: Dictionary): string =>
  OPTIONAL_FIELD_NAMES.includes(name)
    ? dictionary.cart[name]
    : requiredLabel(dictionary.cart[name]);

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

const fillRequiredFields = (
  dictionary: Dictionary = UK_DICTIONARY,
  phone: string = TYPED_UK_PHONE
): void => {
  for (const name of REQUIRED_FIELD_NAMES) {
    const value = name === "telephone" ? phone : VALUES[name];

    typeInto(name, withPadding(value), dictionary);
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

const channelChips = (): HTMLElement[] => screen.getAllByRole("radio");

const channelChip = (label: string): HTMLElement =>
  screen.getByRole("radio", { name: label });

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
  fillRequiredFields();
  await submit();
};

const deferNextResponse = (): ((response: Response) => void) => {
  let settle: (response: Response) => void = () => undefined;

  fetchMock.mockReturnValue(
    new Promise<Response>((resolve) => {
      settle = resolve;
    })
  );

  return (response) => {
    settle(response);
  };
};

const readRequest = (index = 0): CapturedRequest => {
  const call = fetchMock.mock.calls.at(index);

  if (call === undefined) {
    throw new Error(`The checkout form issued no request number ${index + 1}`);
  }

  const [url, init] = call;

  return { url, init };
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

beforeEach(() => {
  useCartStore.setState({ items: [...CART_LINES] });
  fetchMock = createFetchMock();
  onPlaced = vi.fn<() => void>();
  vi.stubGlobal("fetch", fetchMock);
});

describe("CheckoutForm validation", () => {
  it("issues no request when an empty form is submitted", async () => {
    renderForm();

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("reports an error on each of the six required fields and on none of the three optional ones", async () => {
    renderForm();

    await submit();

    expect(alertTexts()).toEqual(
      REQUIRED_FIELD_NAMES.map(() => UK_DICTIONARY.cart.required)
    );

    for (const name of OPTIONAL_FIELD_NAMES) {
      expect(errorFor(name), name).toBeNull();
      expect(fieldFor(name).getAttribute("aria-invalid"), name).not.toBe(
        "true"
      );
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

  it("treats a whitespace-only required value as missing", async () => {
    renderForm();
    fillRequiredFields();
    typeInto("city", "   ");

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorFor("city")).toBe(UK_DICTIONARY.cart.required);
    expect(document.activeElement).toBe(fieldFor("city"));
  });

  it("calls an empty phone required, because nothing was typed there yet", async () => {
    renderForm();

    await submit();

    expect(errorFor("telephone")).toBe(UK_DICTIONARY.cart.required);
  });

  it("calls a filled but malformed phone badly formatted and never required, so the shopper is not told to fill a field they filled", async () => {
    renderForm();
    fillRequiredFields();
    typeInto("telephone", MALFORMED_PHONE);

    await submit();

    expect(errorFor("telephone")).toBe(UK_DICTIONARY.cart.phone_invalid);
    expect(alertTexts()).toEqual([UK_DICTIONARY.cart.phone_invalid]);
    expect(document.activeElement).toBe(fieldFor("telephone"));
  });

  it("issues no request when the phone is the only malformed value", async () => {
    renderForm();
    fillRequiredFields();
    typeInto("telephone", MALFORMED_PHONE);

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onPlaced).not.toHaveBeenCalled();
  });
});

describe("CheckoutForm recipient and contact fields", () => {
  it("renders the patronymic field under uk, where the operator addresses people by it", () => {
    renderForm();

    expect(fieldFor("patronymic")).toBeInstanceOf(HTMLInputElement);
  });

  it("renders no patronymic field under en, where the name has no such part", () => {
    renderForm({ locale: "en", dictionary: EN_DICTIONARY });

    expect(
      screen.queryByLabelText(labelFor("patronymic", EN_DICTIONARY))
    ).toBeNull();
    expect(
      screen.queryByLabelText(labelFor("patronymic", UK_DICTIONARY))
    ).toBeNull();
  });

  it("sends the trimmed patronymic the shopper filled in", async () => {
    renderForm();
    fillRequiredFields();
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
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);

    fireEvent.click(channelChip(UK_DICTIONARY.cart.channel_telegram));

    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
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
    fillRequiredFields();
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

  it("declares the delivery mode generic under the uk locale, because U5a knows no carrier directory yet", async () => {
    renderForm({ locale: "uk" });
    fillRequiredFields();

    await submit();

    expect(readGroup("delivery")).toEqual({
      mode: "generic",
      country: VALUES.country,
      city: VALUES.city,
      address: VALUES.address,
    });
  });

  it("sends the trimmed region when the shopper filled it in", async () => {
    renderForm();
    fillRequiredFields();
    typeInto("state", withPadding(VALUES.state));

    await submit();

    expect(readGroup("delivery").state).toBe(VALUES.state);
  });

  it("sends the trimmed comment the shopper typed", async () => {
    renderForm();
    fillRequiredFields();
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
    fillRequiredFields(EN_DICTIONARY, TYPED_INTERNATIONAL_PHONE);

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
    fillRequiredFields(EN_DICTIONARY, TYPED_INTERNATIONAL_PHONE);

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

    expect(readRequest().url).toBe("/api/place_order");
  });

  it("posts the payload as JSON", async () => {
    await placeOrder();

    const { init } = readRequest();

    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("reports success to the caller once when the relay accepts the order", async () => {
    await placeOrder();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutForm failure path", () => {
  it("does not report success when the relay is unconfigured and answers 503", async () => {
    fetchMock.mockResolvedValue(respondWith(SERVICE_UNAVAILABLE_STATUS));

    await placeOrder();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("leaves the cart untouched when the relay answers 503", async () => {
    fetchMock.mockResolvedValue(respondWith(SERVICE_UNAVAILABLE_STATUS));

    await placeOrder();

    expect(useCartStore.getState().items).toEqual([...CART_LINES]);
  });

  it("does not report success when the request itself fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await placeOrder();

    expect(onPlaced).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([...CART_LINES]);
  });

  it("raises the order error toast when the relay answers 503", async () => {
    fetchMock.mockResolvedValue(respondWith(SERVICE_UNAVAILABLE_STATUS));

    await placeOrder();

    const toast = await screen.findByText(UK_DICTIONARY.cart.order_error);

    expect(toast.textContent).toBe(UK_DICTIONARY.cart.order_error);
  });

  it("raises the order error toast when the request itself fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await placeOrder();

    const toast = await screen.findByText(UK_DICTIONARY.cart.order_error);

    expect(toast.textContent).toBe(UK_DICTIONARY.cart.order_error);
  });
});

describe("CheckoutForm idempotency key", () => {
  it("sends a canonical v4 uuid the relay can deduplicate on", async () => {
    await placeOrder();

    expect(readKey()).toMatch(UUID_V4);
  });

  it("repeats the same key when the shopper retries after a refusal, so a retry never reads as a second order", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(SERVICE_UNAVAILABLE_STATUS));
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    renderForm();
    fillRequiredFields();
    await submit();
    await submit();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onPlaced).not.toHaveBeenCalled();
    expect(readKey(1)).toBe(readKey(0));
  });

  it("mints a fresh key for the next order once one succeeded, so a real second order is never swallowed", async () => {
    renderForm();
    fillRequiredFields();
    await submit();
    await submit();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onPlaced).toHaveBeenCalledTimes(2);
    expect(readKey(1)).toMatch(UUID_V4);
    expect(readKey(1)).not.toBe(readKey(0));
  });

  it("places the order anyway when the platform offers no crypto source, dropping only the hint", async () => {
    renderForm();
    vi.stubGlobal("crypto", undefined);
    fillRequiredFields();

    await submit();

    expect(readPayload()).not.toHaveProperty("idempotency_key");
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutForm in-flight guard", () => {
  it("disables the submit control and ignores a second submit while the request is in flight", async () => {
    const settle = deferNextResponse();
    const { container } = renderForm();

    fillRequiredFields();
    await submit();

    expect(submitButton().disabled).toBe(true);

    fireEvent.submit(getForm(container));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      settle(respondWith(OK_STATUS));
    });

    expect(submitButton().disabled).toBe(false);
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });

  it("disables every field and every contact chip while the request is in flight, and releases them when it settles", async () => {
    const settle = deferNextResponse();

    renderForm();
    fillRequiredFields();
    await submit();

    for (const name of UK_FIELD_NAMES) {
      expect(isDisabled(fieldFor(name)), name).toBe(true);
    }

    for (const chip of channelChips()) {
      expect(isDisabled(chip), chip.textContent ?? "").toBe(true);
    }

    await act(async () => {
      settle(respondWith(OK_STATUS));
    });

    for (const name of UK_FIELD_NAMES) {
      expect(isDisabled(fieldFor(name)), name).toBe(false);
    }

    for (const chip of channelChips()) {
      expect(isDisabled(chip), chip.textContent ?? "").toBe(false);
    }
  });
});
