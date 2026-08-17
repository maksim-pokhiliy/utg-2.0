import type { Locale } from "@root/data";
import type { Dictionary } from "@root/i18n";

import { requiredDeliveryFields, type NpMethod } from "./delivery";

export const INITIAL_FORM = {
  last_name: "",
  first_name: "",
  patronymic: "",
  telephone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  np_city: "",
  np_warehouse: "",
  street: "",
  building: "",
  apartment: "",
  comment: "",
};

export type CheckoutFormValues = typeof INITIAL_FORM;

export type CheckoutFieldName = keyof CheckoutFormValues;

export const FIELD_ORDER: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "patronymic",
  "telephone",
  "np_city",
  "np_warehouse",
  "street",
  "building",
  "apartment",
  "country",
  "state",
  "city",
  "address",
  "comment",
];

const EN_REQUIRED_FIELDS: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
  "country",
  "city",
  "address",
];

const UK_REQUIRED_CONTACT_FIELDS: readonly CheckoutFieldName[] = [
  "last_name",
  "first_name",
  "telephone",
];

export const requiredFieldsFor = (
  locale: Locale,
  method: NpMethod
): readonly CheckoutFieldName[] =>
  locale === "uk"
    ? [...UK_REQUIRED_CONTACT_FIELDS, ...requiredDeliveryFields(method)]
    : EN_REQUIRED_FIELDS;

export type AutofillToken =
  | "given-name"
  | "family-name"
  | "additional-name"
  | "tel"
  | "country-name"
  | "address-level1"
  | "address-level2"
  | "street-address"
  | "address-line1"
  | "address-line2";

export const AUTOFILL_TOKENS: Record<
  CheckoutFieldName,
  AutofillToken | undefined
> = {
  last_name: "family-name",
  first_name: "given-name",
  patronymic: "additional-name",
  telephone: "tel",
  country: "country-name",
  state: "address-level1",
  city: "address-level2",
  address: "street-address",
  np_city: "address-level2",
  np_warehouse: undefined,
  street: "address-line1",
  building: undefined,
  apartment: "address-line2",
  comment: undefined,
};

export const trimFormValues = (
  values: CheckoutFormValues
): CheckoutFormValues => ({
  last_name: values.last_name.trim(),
  first_name: values.first_name.trim(),
  patronymic: values.patronymic.trim(),
  telephone: values.telephone.trim(),
  country: values.country.trim(),
  state: values.state.trim(),
  city: values.city.trim(),
  address: values.address.trim(),
  np_city: values.np_city.trim(),
  np_warehouse: values.np_warehouse.trim(),
  street: values.street.trim(),
  building: values.building.trim(),
  apartment: values.apartment.trim(),
  comment: values.comment.trim(),
});

export const CONTACT_CHANNELS = ["call", "telegram", "viber"] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export const DEFAULT_CONTACT_CHANNEL: ContactChannel = "call";

export const isContactChannel = (value: string): value is ContactChannel =>
  CONTACT_CHANNELS.some((channel) => channel === value);

export const CHANNEL_LABEL_KEYS = {
  call: "channel_call",
  telegram: "channel_telegram",
  viber: "channel_viber",
} as const satisfies Record<ContactChannel, keyof Dictionary["cart"]>;
