import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { CheckoutForm } from "@root/components/checkout/CheckoutForm";
import type { CheckoutFieldName } from "@root/components/checkout/fields";
import {
  composeCartLine,
  useCartStore,
  type ICartItem,
} from "@root/store/cart";

import {
  UAH_MONEY,
  UK_DICTIONARY,
  USD_MONEY,
  renderWithI18n,
} from "../../support/renderWithI18n";

type FetchMock = Mock<typeof fetch>;

type FetchInput = Parameters<typeof fetch>[0];

type FetchInit = Parameters<typeof fetch>[1];

interface CapturedRequest {
  url: FetchInput;
  init: FetchInit;
}

interface CustomerField {
  name: CheckoutFieldName;
  label: string;
  typed: string;
  expected: string;
}

const OK_STATUS = 200;

const SERVICE_UNAVAILABLE_STATUS = 503;

const REQUIRED_MARKER = " *";

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

const ADDITIONAL_NOTE = UK_DICTIONARY.cart.review;

const withPadding = (value: string): string => `  ${value}  `;

const customerField = (
  name: CheckoutFieldName,
  label: string,
  value: string
): CustomerField => ({
  name,
  label,
  typed: withPadding(value),
  expected: value,
});

const CUSTOMER_FIELDS: readonly CustomerField[] = [
  customerField(
    "first_name",
    UK_DICTIONARY.cart.first_name,
    UK_DICTIONARY.cart.first_name_placeholder
  ),
  customerField(
    "last_name",
    UK_DICTIONARY.cart.last_name,
    UK_DICTIONARY.cart.last_name_placeholder
  ),
  customerField(
    "telephone",
    UK_DICTIONARY.cart.telephone,
    UK_DICTIONARY.cart.telephone_placeholder
  ),
  customerField(
    "country",
    UK_DICTIONARY.cart.country,
    UK_DICTIONARY.cart.country_placeholder
  ),
  customerField(
    "state",
    UK_DICTIONARY.cart.state,
    UK_DICTIONARY.cart.state_placeholder
  ),
  customerField(
    "city",
    UK_DICTIONARY.cart.city,
    UK_DICTIONARY.cart.city_placeholder
  ),
  customerField(
    "address",
    UK_DICTIONARY.cart.address,
    UK_DICTIONARY.cart.address_placeholder
  ),
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const respondWith = (status: number): Response =>
  new Response(null, { status });

const createFetchMock = (): FetchMock =>
  vi.fn<typeof fetch>(() => Promise.resolve(respondWith(OK_STATUS)));

let fetchMock = createFetchMock();

let onPlaced = vi.fn<() => void>();

const requiredLabel = (label: string): string => `${label}${REQUIRED_MARKER}`;

const getRequiredInput = (label: string): HTMLElement =>
  screen.getByLabelText(requiredLabel(label));

const getSubmitButton = (): HTMLButtonElement => {
  const control = screen.getByRole("button", {
    name: UK_DICTIONARY.cart.place_order,
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

const fillRequiredFields = (): void => {
  for (const field of CUSTOMER_FIELDS) {
    fireEvent.change(getRequiredInput(field.label), {
      target: { value: field.typed },
    });
  }
};

const fillOptionalField = (value: string): void => {
  fireEvent.change(screen.getByLabelText(UK_DICTIONARY.cart.additional), {
    target: { value },
  });
};

const submit = async (): Promise<void> => {
  await act(async () => {
    fireEvent.click(getSubmitButton());
  });
};

const placeOrder = async (): Promise<void> => {
  renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);
  fillRequiredFields();
  await submit();
};

const readRequest = (): CapturedRequest => {
  const call = fetchMock.mock.calls.at(0);

  if (call === undefined) {
    throw new Error("The checkout form issued no request");
  }

  const [url, init] = call;

  return { url, init };
};

const readPayload = (): Record<string, unknown> => {
  const { init } = readRequest();
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
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("reports an error on each of the seven required fields when an empty form is submitted", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);

    await submit();

    const alerts = screen.getAllByRole("alert");

    expect(alerts).toHaveLength(7);

    for (const alert of alerts) {
      expect(alert.textContent).toBe(UK_DICTIONARY.cart.required);
    }
  });

  it("moves focus to the first name field when an empty form is submitted", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);

    await submit();

    expect(document.activeElement).toBe(
      getRequiredInput(UK_DICTIONARY.cart.first_name)
    );
  });

  it("drops the error on a field as soon as it is corrected", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);

    await submit();

    expect(screen.getAllByRole("alert")).toHaveLength(7);

    fireEvent.change(getRequiredInput(UK_DICTIONARY.cart.first_name), {
      target: { value: UK_DICTIONARY.cart.first_name_placeholder },
    });

    expect(screen.getAllByRole("alert")).toHaveLength(6);
  });

  it("treats a whitespace-only required value as missing", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);
    fillRequiredFields();
    fireEvent.change(getRequiredInput(UK_DICTIONARY.cart.city), {
      target: { value: "   " },
    });

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(document.activeElement).toBe(
      getRequiredInput(UK_DICTIONARY.cart.city)
    );
  });
});

describe("CheckoutForm order payload — the contract with the order bot in initiatives/production-polish/extracted/bot-contract-index.js", () => {
  it("sends exactly the keys the bot destructures plus the explicit currency", async () => {
    await placeOrder();

    expect(Object.keys(readPayload()).sort()).toEqual([
      "additional",
      "address",
      "cart",
      "city",
      "country",
      "currency",
      "first_name",
      "last_name",
      "locale",
      "state",
      "telephone",
      "total",
    ]);
  });

  it("sends the trimmed value of every customer field", async () => {
    await placeOrder();

    const payload = readPayload();

    for (const field of CUSTOMER_FIELDS) {
      expect(payload[field.name], field.name).toBe(field.expected);
    }
  });

  it("sends the trimmed note the shopper typed into the optional field", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);
    fillRequiredFields();
    fillOptionalField(withPadding(ADDITIONAL_NOTE));

    await submit();

    expect(readPayload().additional).toBe(ADDITIONAL_NOTE);
  });

  it("sends an empty string for the untouched optional field", async () => {
    await placeOrder();

    expect(readPayload().additional).toBe("");
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
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />, {
      locale: "en",
      money: USD_MONEY,
    });
    fillRequiredFields();
    await submit();

    const payload = readPayload();

    expect(payload.currency).toBe(USD_MONEY.currency);
    expect(payload.total).toBe(
      (SUBTOTAL_UAH * USD_MONEY.coefficient).toFixed(2)
    );
  });

  it("states the currency explicitly, so an en order priced in UAH is never read as USD", async () => {
    renderWithI18n(<CheckoutForm onPlaced={onPlaced} />, {
      locale: "en",
      money: UAH_MONEY,
    });
    fillRequiredFields();
    await submit();

    const payload = readPayload();

    expect(payload.locale).toBe("en");
    expect(payload.currency).toBe("UAH");
    expect(payload.total).toBe(EXPECTED_UAH_TOTAL);
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

describe("CheckoutForm in-flight guard", () => {
  it("disables the submit control and ignores a second submit while the request is in flight", async () => {
    let settle: (response: Response) => void = () => undefined;

    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        settle = resolve;
      })
    );

    const { container } = renderWithI18n(<CheckoutForm onPlaced={onPlaced} />);

    fillRequiredFields();
    await submit();

    expect(getSubmitButton().disabled).toBe(true);

    fireEvent.submit(getForm(container));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      settle(respondWith(OK_STATUS));
    });

    expect(getSubmitButton().disabled).toBe(false);
    expect(onPlaced).toHaveBeenCalledTimes(1);
  });
});
