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

const DESCRIPTION_SEPARATOR = " ";

interface CheckoutDirectoryFieldProps {
  name: CheckoutFieldName;
  label: string;
  placeholder?: string;
  value: string;
  source: DirectorySource;
  options: readonly ComboboxOption[];
  emptyLabel: string;
  isLoading: boolean;
  describedBy?: string;
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
  emptyLabel,
  isLoading,
  describedBy,
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
        emptyLabel={emptyLabel}
        loading={isLoading}
        required
        disabled={disabled}
        error={errorText}
      />
    );
  }

  const describedIds = [describedBy, isInvalid ? `${name}-error` : undefined]
    .filter((id): id is string => id !== undefined)
    .join(DESCRIPTION_SEPARATOR);

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
        onBlur={(event) => onSearch(event.target.value)}
        invalid={isInvalid}
        required
        aria-invalid={isInvalid}
        aria-describedby={describedIds === "" ? undefined : describedIds}
      />
    </Field>
  );
}
