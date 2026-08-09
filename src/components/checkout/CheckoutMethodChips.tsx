"use client";

import { useMemo, type ReactElement } from "react";

import { ChoiceChips } from "@root/design-system";
import { useDictionary } from "@root/i18n";

import {
  METHOD_LABEL_KEYS,
  NP_METHODS,
  isMethodAvailable,
  isNpMethod,
  type MethodAvailability,
  type NpMethod,
} from "./delivery";

const REASON_SEPARATOR = " · ";

interface CheckoutMethodChipsProps {
  method: NpMethod;
  availability: MethodAvailability;
  isPending: boolean;
  onMethodChange: (method: NpMethod) => void;
}

export function CheckoutMethodChips({
  method,
  availability,
  isPending,
  onMethodChange,
}: CheckoutMethodChipsProps): ReactElement {
  const dictionary = useDictionary();

  const options = useMemo(
    () =>
      NP_METHODS.map((id) => ({
        id,
        label: dictionary.cart[METHOD_LABEL_KEYS[id]],
        disabled: !isMethodAvailable(availability, id),
      })),
    [availability, dictionary]
  );

  const reasons = [
    availability.hasWarehouses ? null : dictionary.cart.np_no_warehouses,
    availability.hasCourier ? null : dictionary.cart.np_no_courier,
  ].filter((reason): reason is string => reason !== null);

  return (
    <ChoiceChips
      label={dictionary.cart.delivery_method}
      value={method}
      onChange={(id) => {
        if (isNpMethod(id)) {
          onMethodChange(id);
        }
      }}
      options={options}
      helper={reasons.length === 0 ? undefined : reasons.join(REASON_SEPARATOR)}
      required
      disabled={isPending}
    />
  );
}
