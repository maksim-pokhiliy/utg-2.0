import type { Locale } from "@root/data";
import { selectSubtotal, type ICartItem } from "@root/store/cart";
import type { Currency, IMoney } from "@root/utils/formatPrice";

import type { CheckoutFormValues, ContactChannel } from "./fields";

export const ORDER_PAYLOAD_VERSION = 2;

const GENERIC_MODE = "generic";

const TOTAL_FRACTION_DIGITS = 2;

export interface OrderCartLine {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  productUrl: string;
}

export interface OrderCustomer {
  first_name: string;
  last_name: string;
  patronymic?: string;
  phone: string;
  contact_channel: ContactChannel;
}

export interface GenericDelivery {
  mode: typeof GENERIC_MODE;
  country: string;
  state?: string;
  city: string;
  address: string;
}

export type OrderDelivery = GenericDelivery;

export interface OrderPayloadV2 {
  version: typeof ORDER_PAYLOAD_VERSION;
  idempotency_key?: string;
  locale: Locale;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  comment?: string;
  cart: OrderCartLine[];
  total: string;
  currency: Currency;
}

export interface ComposeOrderInput {
  values: CheckoutFormValues;
  phone: string;
  channel: ContactChannel;
  cart: readonly ICartItem[];
  locale: Locale;
  money: IMoney;
  idempotencyKey?: string;
}

const toOrderLine = ({
  id,
  title,
  price,
  quantity,
  image,
  productUrl,
}: ICartItem): OrderCartLine => ({
  id,
  title,
  price,
  quantity,
  image,
  productUrl,
});

export const composeOrderPayload = ({
  values,
  phone,
  channel,
  cart,
  locale,
  money,
  idempotencyKey,
}: ComposeOrderInput): OrderPayloadV2 => ({
  version: ORDER_PAYLOAD_VERSION,
  ...(idempotencyKey === undefined ? {} : { idempotency_key: idempotencyKey }),
  locale,
  customer: {
    first_name: values.first_name,
    last_name: values.last_name,
    ...(values.patronymic === "" ? {} : { patronymic: values.patronymic }),
    phone,
    contact_channel: channel,
  },
  delivery: {
    mode: GENERIC_MODE,
    country: values.country,
    ...(values.state === "" ? {} : { state: values.state }),
    city: values.city,
    address: values.address,
  },
  ...(values.comment === "" ? {} : { comment: values.comment }),
  cart: cart.map(toOrderLine),
  total: (selectSubtotal({ items: [...cart] }) * money.coefficient).toFixed(
    TOTAL_FRACTION_DIGITS
  ),
  currency: money.currency,
});
