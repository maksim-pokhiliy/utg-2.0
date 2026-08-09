"use client";

import type { ReactElement } from "react";

import { Field, Input } from "@root/design-system";
import { useDictionary, type Dictionary } from "@root/i18n";

import { AUTOFILL_TOKENS, type CheckoutFieldName } from "./fields";
import type { CheckoutFieldError } from "./validation";

const ERROR_KEYS = {
  required: "required",
  phone_format: "phone_invalid",
} as const satisfies Record<CheckoutFieldError, keyof Dictionary["cart"]>;

interface CheckoutFieldProps {
  label: string;
  name: CheckoutFieldName;
  id?: string;
  type?: "text" | "tel";
  value: string;
  placeholder?: string;
  error?: CheckoutFieldError;
  disabled?: boolean;
  isRequired?: boolean;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
}

export function CheckoutField({
  label,
  name,
  id,
  type,
  value,
  placeholder,
  error,
  disabled,
  isRequired = false,
  onValueChange,
}: CheckoutFieldProps): ReactElement {
  const dictionary = useDictionary();

  const fieldId = id ?? name;
  const isInvalid = error !== undefined;

  return (
    <Field
      label={label}
      htmlFor={fieldId}
      required={isRequired}
      error={
        error === undefined ? undefined : dictionary.cart[ERROR_KEYS[error]]
      }
    >
      <Input
        id={fieldId}
        name={name}
        type={type}
        inputMode={type === "tel" ? "tel" : undefined}
        autoComplete={AUTOFILL_TOKENS[name]}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onValueChange(name, event.target.value)}
        invalid={isInvalid}
        required={isRequired}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
      />
    </Field>
  );
}
