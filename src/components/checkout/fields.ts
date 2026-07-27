export const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  telephone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  additional: "",
};

export type CheckoutFormValues = typeof INITIAL_FORM;

export type CheckoutFieldName = keyof CheckoutFormValues;

export const REQUIRED_FIELDS: readonly CheckoutFieldName[] = [
  "first_name",
  "last_name",
  "telephone",
  "country",
  "state",
  "city",
  "address",
];

export const isRequiredField = (name: CheckoutFieldName): boolean =>
  REQUIRED_FIELDS.includes(name);

export type AutofillToken =
  | "given-name"
  | "family-name"
  | "tel"
  | "country-name"
  | "address-level1"
  | "address-level2"
  | "street-address";

export const AUTOFILL_TOKENS: Record<
  CheckoutFieldName,
  AutofillToken | undefined
> = {
  first_name: "given-name",
  last_name: "family-name",
  telephone: "tel",
  country: "country-name",
  state: "address-level1",
  city: "address-level2",
  address: "street-address",
  additional: undefined,
};

export const trimFormValues = (
  values: CheckoutFormValues
): CheckoutFormValues => ({
  first_name: values.first_name.trim(),
  last_name: values.last_name.trim(),
  telephone: values.telephone.trim(),
  country: values.country.trim(),
  state: values.state.trim(),
  city: values.city.trim(),
  address: values.address.trim(),
  additional: values.additional.trim(),
});
