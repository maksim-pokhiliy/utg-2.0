import type { Locale } from "@root/data";
import { normalizePhone } from "@root/utils/phone";

import type { NpMethod } from "./delivery";
import {
  FIELD_ORDER,
  requiredFieldsFor,
  type CheckoutFieldName,
  type CheckoutFormValues,
} from "./fields";

export type CheckoutFieldError = "required" | "phone_format";

export type CheckoutErrors = Partial<
  Record<CheckoutFieldName, CheckoutFieldError>
>;

export type CheckoutVerdict =
  | { isValid: true; phone: string }
  | {
      isValid: false;
      errors: CheckoutErrors;
      firstInvalid: CheckoutFieldName;
    };

const PHONE_FIELD: CheckoutFieldName = "telephone";

export const validateCheckout = (
  values: CheckoutFormValues,
  locale: Locale,
  method: NpMethod
): CheckoutVerdict => {
  const errors: CheckoutErrors = {};

  for (const name of requiredFieldsFor(locale, method)) {
    if (values[name] === "") {
      errors[name] = "required";
    }
  }

  const phone =
    values.telephone === "" ? null : normalizePhone(values.telephone, locale);

  if (values.telephone !== "" && phone === null) {
    errors[PHONE_FIELD] = "phone_format";
  }

  const firstInvalid = FIELD_ORDER.find((name) => errors[name] !== undefined);

  if (firstInvalid === undefined && phone !== null) {
    return { isValid: true, phone };
  }

  return { isValid: false, errors, firstInvalid: firstInvalid ?? PHONE_FIELD };
};
