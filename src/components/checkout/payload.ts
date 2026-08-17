import type { Locale } from "@root/data";
import { selectSubtotal, type ICartItem } from "@root/store/cart";
import type { Currency, IMoney } from "@root/utils/formatPrice";

import {
  composeDeliveryCity,
  isWarehouseMethod,
  resolveDeliverySource,
  type DeliverySource,
  type NpMethod,
  type SettlementChoice,
  type WarehouseChoice,
} from "./delivery";
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

export interface NpWarehouseDelivery {
  mode: "np_branch" | "np_postomat";
  source: DeliverySource;
  city: string;
  warehouse: string;
  warehouse_number?: string;
}

export interface NpCourierDelivery {
  mode: "np_courier";
  source: DeliverySource;
  city: string;
  street: string;
  building: string;
  apartment?: string;
}

export interface GenericDelivery {
  mode: typeof GENERIC_MODE;
  country: string;
  state?: string;
  city: string;
  address: string;
}

export type OrderDelivery =
  | NpWarehouseDelivery
  | NpCourierDelivery
  | GenericDelivery;

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

export interface DeliverySelection {
  method: NpMethod;
  cityChoice: SettlementChoice | null;
  warehouseChoice: WarehouseChoice | null;
}

export interface ComposeOrderInput {
  values: CheckoutFormValues;
  phone: string;
  channel: ContactChannel;
  cart: readonly ICartItem[];
  locale: Locale;
  money: IMoney;
  delivery: DeliverySelection;
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

const composeGenericDelivery = (
  values: CheckoutFormValues
): GenericDelivery => ({
  mode: GENERIC_MODE,
  country: values.country,
  ...(values.state === "" ? {} : { state: values.state }),
  city: values.city,
  address: values.address,
});

const composeNpDelivery = (
  values: CheckoutFormValues,
  { method, cityChoice, warehouseChoice }: DeliverySelection
): NpWarehouseDelivery | NpCourierDelivery => {
  const source = resolveDeliverySource({ method, cityChoice, warehouseChoice });
  const city = composeDeliveryCity(cityChoice, values.np_city);

  if (!isWarehouseMethod(method)) {
    return {
      mode: "np_courier",
      source,
      city,
      street: values.street,
      building: values.building,
      ...(values.apartment === "" ? {} : { apartment: values.apartment }),
    };
  }

  return {
    mode: method === "np_postomat" ? "np_postomat" : "np_branch",
    source,
    city,
    warehouse: values.np_warehouse,
    ...(warehouseChoice === null
      ? {}
      : { warehouse_number: warehouseChoice.number }),
  };
};

export const composeOrderPayload = ({
  values,
  phone,
  channel,
  cart,
  locale,
  money,
  delivery,
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
  delivery:
    locale === "uk"
      ? composeNpDelivery(values, delivery)
      : composeGenericDelivery(values),
  ...(values.comment === "" ? {} : { comment: values.comment }),
  cart: cart.map(toOrderLine),
  total: (selectSubtotal({ items: [...cart] }) * money.coefficient).toFixed(
    TOTAL_FRACTION_DIGITS
  ),
  currency: money.currency,
});
