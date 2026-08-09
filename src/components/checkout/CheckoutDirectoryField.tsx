"use client";

import { useEffect, useRef, type ReactElement } from "react";

import {
  Combobox,
  Field,
  Input,
  type ComboboxOption,
} from "@root/design-system";
import { useDictionary, type Dictionary } from "@root/i18n";

import { AUTOFILL_TOKENS, type CheckoutFieldName } from "./fields";
import type { DirectorySource } from "./delivery";
import type { CheckoutFieldError } from "./validation";

const ERROR_KEYS = {
  required: "required",
  phone_format: "phone_invalid",
} as const satisfies Record<CheckoutFieldError, keyof Dictionary["cart"]>;

interface CheckoutDirectoryFieldProps {
  name: CheckoutFieldName;
  label: string;
  placeholder?: string;
  value: string;
  source: DirectorySource;
  options: readonly ComboboxOption[];
  isLoading: boolean;
  error?: CheckoutFieldError;
  disabled?: boolean;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
  onSearch: (query: string) => void;
  onSelect: (option: ComboboxOption) => void;
}

export function CheckoutDirectoryField({
  name,
  label,
  placeholder,
  value,
  source,
  options,
  isLoading,
  error,
  disabled,
  onValueChange,
  onSearch,
  onSelect,
}: CheckoutDirectoryFieldProps): ReactElement {
  const dictionary = useDictionary();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousSourceRef = useRef(source);

  const isInvalid = error !== undefined;
  const errorText =
    error === undefined ? undefined : dictionary.cart[ERROR_KEYS[error]];

  useEffect(() => {
    const hasFlipped = previousSourceRef.current !== source;

    previousSourceRef.current = source;

    if (!hasFlipped || source !== "manual") {
      return;
    }

    const input = inputRef.current;

    if (input === null || document.activeElement !== document.body) {
      return;
    }

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [source]);

  if (source === "directory") {
    return (
      <Combobox
        id={name}
        label={label}
        placeholder={placeholder}
        value={value}
        onValueChange={(next) => onValueChange(name, next)}
        onSearch={onSearch}
        onSelect={onSelect}
        options={options}
        emptyLabel={dictionary.cart.np_empty}
        loading={isLoading}
        required
        disabled={disabled}
        error={errorText}
      />
    );
  }

  return (
    <Field label={label} htmlFor={name} required error={errorText}>
      <Input
        ref={inputRef}
        id={name}
        name={name}
        autoComplete={AUTOFILL_TOKENS[name]}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onValueChange(name, event.target.value)}
        invalid={isInvalid}
        required
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${name}-error` : undefined}
      />
    </Field>
  );
}
