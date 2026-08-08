"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";

import {
  Button,
  ChoiceChips,
  Field,
  Separator,
  Textarea,
  Typography,
  toast,
} from "@root/design-system";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { useCartStore } from "@root/store/cart";
import { createIdempotencyKey } from "@root/utils/idempotencyKey";

import { CheckoutField } from "./CheckoutField";
import {
  CHANNEL_LABEL_KEYS,
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CHANNEL,
  INITIAL_FORM,
  isContactChannel,
  trimFormValues,
  type CheckoutFieldName,
  type CheckoutFormValues,
  type ContactChannel,
} from "./fields";
import { composeOrderPayload } from "./payload";
import { validateCheckout, type CheckoutErrors } from "./validation";

const FIELD_PAIR = "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4";

const ORDER_ROUTE = "/api/place_order";

const COMMENT_ROWS = 4;

interface CheckoutFormProps {
  isPending: boolean;
  onPendingChange: (isPending: boolean) => void;
  onPlaced: () => void;
}

export function CheckoutForm({
  isPending,
  onPendingChange,
  onPlaced,
}: CheckoutFormProps): ReactElement {
  const cart = useCartStore((state) => state.items);

  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const [form, setForm] = useState<CheckoutFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [channel, setChannel] = useState<ContactChannel>(
    DEFAULT_CONTACT_CHANNEL
  );

  const idempotencyKey = useRef<string | undefined>(undefined);

  const handleValueChange = (name: CheckoutFieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (prev[name] === undefined) {
        return prev;
      }

      const next = { ...prev };

      delete next[name];

      return next;
    });
  };

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleValueChange("comment", event.target.value);
  };

  const handleChannelChange = (id: string) => {
    if (isContactChannel(id)) {
      setChannel(id);
    }
  };

  const placeOrder = async (
    values: CheckoutFormValues,
    phone: string
  ): Promise<boolean> => {
    if (idempotencyKey.current === undefined) {
      idempotencyKey.current = createIdempotencyKey();
    }

    const payload = composeOrderPayload({
      values,
      phone,
      channel,
      cart,
      locale,
      money,
      idempotencyKey: idempotencyKey.current,
    });

    try {
      const response = await fetch(ORDER_ROUTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error(dictionary.cart.order_error);

        return false;
      }

      idempotencyKey.current = undefined;

      return true;
    } catch {
      toast.error(dictionary.cart.order_error);

      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const values = trimFormValues(form);
    const verdict = validateCheckout(values, locale);

    if (!verdict.isValid) {
      setErrors(verdict.errors);
      document.getElementById(verdict.firstInvalid)?.focus();

      return;
    }

    setErrors({});
    onPendingChange(true);

    const isPlaced = await placeOrder(values, verdict.phone);

    onPendingChange(false);

    if (isPlaced) {
      onPlaced();
    }
  };

  return (
    <form
      className="min-w-0 flex-[2_1_360px]"
      noValidate
      onSubmit={handleSubmit}
    >
      <Typography variant="h3" as="h2" className="mb-4">
        {dictionary.cart.customer_details}
      </Typography>

      <div className="flex flex-col gap-4">
        <div className={FIELD_PAIR}>
          <CheckoutField
            name="last_name"
            label={dictionary.cart.last_name}
            placeholder={dictionary.cart.last_name_placeholder}
            value={form.last_name}
            error={errors.last_name}
            disabled={isPending}
            onValueChange={handleValueChange}
          />

          <CheckoutField
            name="first_name"
            label={dictionary.cart.first_name}
            placeholder={dictionary.cart.first_name_placeholder}
            value={form.first_name}
            error={errors.first_name}
            disabled={isPending}
            onValueChange={handleValueChange}
          />
        </div>

        {locale === "uk" ? (
          <CheckoutField
            name="patronymic"
            label={dictionary.cart.patronymic}
            value={form.patronymic}
            error={errors.patronymic}
            disabled={isPending}
            onValueChange={handleValueChange}
          />
        ) : null}

        <CheckoutField
          name="telephone"
          type="tel"
          label={dictionary.cart.telephone}
          placeholder={dictionary.cart.telephone_placeholder}
          value={form.telephone}
          error={errors.telephone}
          disabled={isPending}
          onValueChange={handleValueChange}
        />

        <ChoiceChips
          label={dictionary.cart.contact_channel}
          value={channel}
          onChange={handleChannelChange}
          options={CONTACT_CHANNELS.map((id) => ({
            id,
            label: dictionary.cart[CHANNEL_LABEL_KEYS[id]],
          }))}
          required
          disabled={isPending}
        />
      </div>

      <Separator weight="hair" className="my-8" />

      <Typography variant="h3" as="h2" className="mb-4">
        {dictionary.cart.delivery_details}
      </Typography>

      <div className="flex flex-col gap-4">
        <div className={FIELD_PAIR}>
          <CheckoutField
            name="country"
            label={dictionary.cart.country}
            placeholder={dictionary.cart.country_placeholder}
            value={form.country}
            error={errors.country}
            disabled={isPending}
            onValueChange={handleValueChange}
          />

          <CheckoutField
            name="state"
            label={dictionary.cart.state}
            placeholder={dictionary.cart.state_placeholder}
            value={form.state}
            error={errors.state}
            disabled={isPending}
            onValueChange={handleValueChange}
          />
        </div>

        <CheckoutField
          name="city"
          label={dictionary.cart.city}
          placeholder={dictionary.cart.city_placeholder}
          value={form.city}
          error={errors.city}
          disabled={isPending}
          onValueChange={handleValueChange}
        />

        <CheckoutField
          name="address"
          label={dictionary.cart.address}
          placeholder={dictionary.cart.address_placeholder}
          value={form.address}
          error={errors.address}
          disabled={isPending}
          onValueChange={handleValueChange}
        />

        <Field label={dictionary.cart.comment} htmlFor="comment">
          <Textarea
            id="comment"
            name="comment"
            value={form.comment}
            onChange={handleCommentChange}
            disabled={isPending}
            rows={COMMENT_ROWS}
          />
        </Field>
      </div>

      <div className="mt-6 border-2 border-ink px-5 py-4">
        <Typography variant="small" as="p" className="max-w-[60ch] text-pretty">
          {dictionary.cart.expectations}
        </Typography>
      </div>

      <Typography
        variant="caption"
        as="p"
        className="mt-4 mb-3 max-w-[60ch] text-pretty text-ink-faint"
      >
        {dictionary.cart.consent}
      </Typography>

      <Button variant="accent" block type="submit" loading={isPending}>
        {dictionary.cart.place_order}
      </Button>
    </form>
  );
}
