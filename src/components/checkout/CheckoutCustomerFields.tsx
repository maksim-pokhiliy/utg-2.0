"use client";

import type { ReactElement } from "react";

import { ChoiceChips } from "@root/design-system";
import { useDictionary, useLocale } from "@root/i18n";

import { CheckoutField } from "./CheckoutField";
import {
  CHANNEL_LABEL_KEYS,
  CONTACT_CHANNELS,
  type CheckoutFieldName,
  type CheckoutFormValues,
  type ContactChannel,
} from "./fields";
import type { CheckoutErrors } from "./validation";

export const FIELD_PAIR =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4";

interface CheckoutCustomerFieldsProps {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  isPending: boolean;
  channel: ContactChannel;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
  onChannelChange: (id: string) => void;
}

export function CheckoutCustomerFields({
  values,
  errors,
  isPending,
  channel,
  onValueChange,
  onChannelChange,
}: CheckoutCustomerFieldsProps): ReactElement {
  const dictionary = useDictionary();
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <div className={FIELD_PAIR}>
        <CheckoutField
          name="last_name"
          label={dictionary.cart.last_name}
          placeholder={dictionary.cart.last_name_placeholder}
          value={values.last_name}
          error={errors.last_name}
          disabled={isPending}
          isRequired
          onValueChange={onValueChange}
        />

        <CheckoutField
          name="first_name"
          label={dictionary.cart.first_name}
          placeholder={dictionary.cart.first_name_placeholder}
          value={values.first_name}
          error={errors.first_name}
          disabled={isPending}
          isRequired
          onValueChange={onValueChange}
        />
      </div>

      {locale === "uk" ? (
        <CheckoutField
          name="patronymic"
          label={dictionary.cart.patronymic}
          value={values.patronymic}
          error={errors.patronymic}
          disabled={isPending}
          onValueChange={onValueChange}
        />
      ) : null}

      <CheckoutField
        name="telephone"
        type="tel"
        label={dictionary.cart.telephone}
        placeholder={dictionary.cart.telephone_placeholder}
        value={values.telephone}
        error={errors.telephone}
        disabled={isPending}
        isRequired
        onValueChange={onValueChange}
      />

      <ChoiceChips
        label={dictionary.cart.contact_channel}
        value={channel}
        onChange={onChannelChange}
        options={CONTACT_CHANNELS.map((id) => ({
          id,
          label: dictionary.cart[CHANNEL_LABEL_KEYS[id]],
        }))}
        required
        disabled={isPending}
      />
    </div>
  );
}
