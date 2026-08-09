"use client";

import type { ReactElement } from "react";

import { useDictionary } from "@root/i18n";

import { CheckoutField } from "./CheckoutField";
import { FIELD_PAIR } from "./CheckoutCustomerFields";
import type { CheckoutFieldName, CheckoutFormValues } from "./fields";
import type { CheckoutErrors } from "./validation";

interface CheckoutGenericDeliveryFieldsProps {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  isPending: boolean;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
}

export function CheckoutGenericDeliveryFields({
  values,
  errors,
  isPending,
  onValueChange,
}: CheckoutGenericDeliveryFieldsProps): ReactElement {
  const dictionary = useDictionary();

  return (
    <>
      <div className={FIELD_PAIR}>
        <CheckoutField
          name="country"
          label={dictionary.cart.country}
          placeholder={dictionary.cart.country_placeholder}
          value={values.country}
          error={errors.country}
          disabled={isPending}
          isRequired
          onValueChange={onValueChange}
        />

        <CheckoutField
          name="state"
          label={dictionary.cart.state}
          placeholder={dictionary.cart.state_placeholder}
          value={values.state}
          error={errors.state}
          disabled={isPending}
          onValueChange={onValueChange}
        />
      </div>

      <CheckoutField
        name="city"
        label={dictionary.cart.city}
        placeholder={dictionary.cart.city_placeholder}
        value={values.city}
        error={errors.city}
        disabled={isPending}
        isRequired
        onValueChange={onValueChange}
      />

      <CheckoutField
        name="address"
        label={dictionary.cart.address}
        placeholder={dictionary.cart.address_placeholder}
        value={values.address}
        error={errors.address}
        disabled={isPending}
        isRequired
        onValueChange={onValueChange}
      />
    </>
  );
}
