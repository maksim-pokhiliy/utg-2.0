"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState, type ReactElement } from "react";

import {
  Button,
  Container,
  Field,
  Input,
  Price,
  SectionBand,
  Separator,
  Textarea,
  Typography,
  toast,
} from "@root/design-system";
import { formatPrice } from "@root/utils/formatPrice";
import {
  useCartStore,
  useCartHydrated,
  selectItemCount,
  selectSubtotal,
} from "@root/store/cart";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { NavLink } from "@root/components/layout/NavLink";

export default function CheckoutScreen(): ReactElement {
  const cart = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const hydrated = useCartHydrated();
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    telephone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    additional: "",
  });

  const summary = useCartStore(selectItemCount);

  const total = useCartStore(selectSubtotal);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const payload = {
        ...form,
        cart,
        locale,
        total: (total * money.coefficient).toFixed(2),
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

      clear();
      toast.success(dictionary.cart.order_success);
    } catch {
      toast.error(dictionary.cart.order_error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10 lg:pb-20">
      <SectionBand title={dictionary.checkout.checkout} center />

      {!hydrated ? null : cart.length ? (
        <Container className="py-10">
          <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-start relative">
            <form className="w-full lg:basis-1/2" onSubmit={handleSubmit}>
              <Typography variant="h3" as="h2" className="mb-4">
                {dictionary.cart.customer_details}
              </Typography>

              <div className="flex flex-col gap-4">
                <Field
                  label={dictionary.cart.first_name}
                  htmlFor="first_name"
                  required
                >
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    placeholder={dictionary.cart.first_name_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field
                  label={dictionary.cart.last_name}
                  htmlFor="last_name"
                  required
                >
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    placeholder={dictionary.cart.last_name_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field
                  label={dictionary.cart.telephone}
                  htmlFor="telephone"
                  required
                >
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    value={form.telephone}
                    placeholder={dictionary.cart.telephone_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>
              </div>

              <Typography variant="h3" as="h2" className="mb-4 mt-8">
                {dictionary.cart.delivery_details}
              </Typography>

              <div className="flex flex-col gap-4">
                <Field
                  label={dictionary.cart.country}
                  htmlFor="country"
                  required
                >
                  <Input
                    id="country"
                    name="country"
                    value={form.country}
                    placeholder={dictionary.cart.country_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field label={dictionary.cart.state} htmlFor="state" required>
                  <Input
                    id="state"
                    name="state"
                    value={form.state}
                    placeholder={dictionary.cart.state_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field label={dictionary.cart.city} htmlFor="city" required>
                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    placeholder={dictionary.cart.city_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field
                  label={dictionary.cart.address}
                  htmlFor="address"
                  required
                >
                  <Input
                    id="address"
                    name="address"
                    value={form.address}
                    placeholder={dictionary.cart.address_placeholder}
                    onChange={handleFormChange}
                    required
                  />
                </Field>

                <Field label={dictionary.cart.additional} htmlFor="additional">
                  <Textarea
                    id="additional"
                    name="additional"
                    value={form.additional}
                    placeholder={dictionary.cart.additional}
                    onChange={handleFormChange}
                    rows={6}
                  />
                </Field>
              </div>

              <Typography variant="small" as="p" className="my-6">
                {dictionary.cart.review}
              </Typography>

              <Button type="submit" block loading={isLoading}>
                {dictionary.cart.place_order}
              </Button>
            </form>

            <div className="flex flex-col w-full lg:basis-1/2 static lg:sticky top-0 bg-muted p-4">
              <Typography variant="caption" as="p">
                {dictionary.checkout.summary} ({summary})
              </Typography>

              <Separator weight="hair" className="my-4" />

              <div className="flex flex-col">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <div className="relative w-12 h-12 border border-ink shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        quality={75}
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <Typography variant="small" as="span">
                          {item.title}
                        </Typography>

                        <Typography
                          variant="caption"
                          as="span"
                          className="text-ink-faint"
                        >
                          {dictionary.shared.quantity}: {item.quantity}
                        </Typography>
                      </div>

                      <Price>
                        {formatPrice(item.price * item.quantity, money, locale)}
                      </Price>
                    </div>
                  </div>
                ))}
              </div>

              <Separator weight="hair" className="my-4" />

              <div className="flex items-center justify-between">
                <Typography variant="caption" as="span">
                  {dictionary.cart.total}
                </Typography>

                <Price size="big">{formatPrice(total, money, locale)}</Price>
              </div>
            </div>
          </div>
        </Container>
      ) : (
        <Container className="py-10 flex flex-col items-center text-center gap-2">
          <Typography variant="h3" as="p">
            {dictionary.cart.empty_cart}
          </Typography>

          <Typography variant="small" as="p" className="text-ink-faint">
            {dictionary.cart.add_to_cart}{" "}
            <NavLink href="/category" className="text-flag-blue">
              {dictionary.cart.here}
            </NavLink>
          </Typography>
        </Container>
      )}
    </div>
  );
}
