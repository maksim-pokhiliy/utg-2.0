"use client";

import type { ChangeEventHandler, ReactElement } from "react";

import { Field, Input } from "@root/design-system";
import { useDictionary } from "@root/i18n";

import {
  AUTOFILL_TOKENS,
  isRequiredField,
  type CheckoutFieldName,
} from "./fields";

interface CheckoutFieldProps {
  label: string;
  name: CheckoutFieldName;
  type?: "text" | "tel";
  value: string;
  placeholder: string;
  isInvalid: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function CheckoutField({
  label,
  name,
  type,
  value,
  placeholder,
  isInvalid,
  onChange,
}: CheckoutFieldProps): ReactElement {
  const dictionary = useDictionary();

  const isRequired = isRequiredField(name);

  return (
    <Field
      label={label}
      htmlFor={name}
      required={isRequired}
      error={isInvalid ? dictionary.cart.required : undefined}
    >
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={AUTOFILL_TOKENS[name]}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        invalid={isInvalid}
        required={isRequired}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${name}-error` : undefined}
      />
    </Field>
  );
}
