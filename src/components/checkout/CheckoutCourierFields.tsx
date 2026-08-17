"use client";

import type { ReactElement } from "react";

import { useDictionary } from "@root/i18n";

import { CheckoutField } from "./CheckoutField";
import type { CheckoutFieldName, CheckoutFormValues } from "./fields";
import type { CheckoutErrors } from "./validation";

const BUILDING_PAIR =
  "grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4";

interface CheckoutCourierFieldsProps {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  isPending: boolean;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
}

export function CheckoutCourierFields({
  values,
  errors,
  isPending,
  onValueChange,
}: CheckoutCourierFieldsProps): ReactElement {
  const dictionary = useDictionary();

  return (
    <>
      <CheckoutField
        name="street"
        label={dictionary.cart.street}
        value={values.street}
        error={errors.street}
        disabled={isPending}
        isRequired
        onValueChange={onValueChange}
      />

      <div className={BUILDING_PAIR}>
        <CheckoutField
          name="building"
          label={dictionary.cart.building}
          value={values.building}
          error={errors.building}
          disabled={isPending}
          isRequired
          onValueChange={onValueChange}
        />

        <CheckoutField
          name="apartment"
          label={dictionary.cart.apartment}
          value={values.apartment}
          error={errors.apartment}
          disabled={isPending}
          onValueChange={onValueChange}
        />
      </div>
    </>
  );
}
