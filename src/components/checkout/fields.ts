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
