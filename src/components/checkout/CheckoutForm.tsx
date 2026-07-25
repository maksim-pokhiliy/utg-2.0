"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";

import {
  Button,
  Field,
  Separator,
  Textarea,
  Typography,
  toast,
} from "@root/design-system";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { selectSubtotal, useCartStore } from "@root/store/cart";

import { CheckoutField } from "./CheckoutField";
import {
  INITIAL_FORM,
  REQUIRED_FIELDS,
  type CheckoutFieldName,
  type CheckoutFormValues,
} from "./fields";

const FIELD_PAIR = "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4";

interface CheckoutFormProps {
  onPlaced: () => void;
}

export function CheckoutForm({ onPlaced }: CheckoutFormProps): ReactElement {
  const cart = useCartStore((state) => state.items);
  const total = useCartStore(selectSubtotal);

  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const [form, setForm] = useState<CheckoutFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutFieldName[]>([]);
  const [isPending, setIsPending] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => prev.filter((field) => field !== name));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const missing = REQUIRED_FIELDS.filter((name) => form[name].trim() === "");
    const [firstMissing] = missing;

    if (firstMissing !== undefined) {
      setErrors(missing);
      document.getElementById(firstMissing)?.focus();

      return;
    }

    try {
      setIsPending(true);

      const payload = {
        ...form,
        cart,
        locale,
        total: (total * money.coefficient).toFixed(2),
        currency: money.currency,
      };

      const response = await fetch("/api/place_order/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error(dictionary.cart.order_error);

        return;
      }

      onPlaced();
    } catch {
      toast.error(dictionary.cart.order_error);
    } finally {
      setIsPending(false);
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
            name="first_name"
            label={dictionary.cart.first_name}
            placeholder={dictionary.cart.first_name_placeholder}
            value={form.first_name}
            isInvalid={errors.includes("first_name")}
            onChange={handleChange}
          />

          <CheckoutField
            name="last_name"
            label={dictionary.cart.last_name}
            placeholder={dictionary.cart.last_name_placeholder}
            value={form.last_name}
            isInvalid={errors.includes("last_name")}
            onChange={handleChange}
          />
        </div>

        <CheckoutField
          name="telephone"
          type="tel"
          label={dictionary.cart.telephone}
          placeholder={dictionary.cart.telephone_placeholder}
          value={form.telephone}
          isInvalid={errors.includes("telephone")}
          onChange={handleChange}
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
            isInvalid={errors.includes("country")}
            onChange={handleChange}
          />

          <CheckoutField
            name="state"
            label={dictionary.cart.state}
            placeholder={dictionary.cart.state_placeholder}
            value={form.state}
            isInvalid={errors.includes("state")}
            onChange={handleChange}
          />
        </div>

        <CheckoutField
          name="city"
          label={dictionary.cart.city}
          placeholder={dictionary.cart.city_placeholder}
          value={form.city}
          isInvalid={errors.includes("city")}
          onChange={handleChange}
        />

        <CheckoutField
          name="address"
          label={dictionary.cart.address}
          placeholder={dictionary.cart.address_placeholder}
          value={form.address}
          isInvalid={errors.includes("address")}
          onChange={handleChange}
        />

        <Field label={dictionary.cart.additional} htmlFor="additional">
          <Textarea
            id="additional"
            name="additional"
            value={form.additional}
            onChange={handleChange}
            rows={5}
          />
        </Field>
      </div>

      <Typography variant="small" as="p" className="my-6 text-ink-soft">
        {dictionary.cart.review}
      </Typography>

      <Button variant="accent" block type="submit" loading={isPending}>
        {dictionary.cart.place_order}
      </Button>
    </form>
  );
}
