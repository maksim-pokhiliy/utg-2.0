"use client";

import { useRecoilState, useRecoilValue } from "recoil";
import { Button, HR, Label, Textarea, TextInput } from "flowbite-react";
import { ChangeEvent, FormEvent, useState } from "react";

import { currencyMap, formatPrice } from "@root/utils/formatPrice";
import useNotification from "@root/hooks/useNotification";

import {
  cartState,
  dictionaryState,
  exchangeCoefficientState,
  languageState,
} from "@root/recoil/atoms";

import CartItem from "../ui/Cart/CartItem";
import { NavLink } from "../layout/NavBar/NavLink";

export default function CheckoutScreen() {
  const notyf = useNotification();

  const [cart, setCart] = useRecoilState(cartState);
  const dictionary = useRecoilValue(dictionaryState);
  const coefficient = useRecoilValue(exchangeCoefficientState);
  const locale = useRecoilValue(languageState);

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

  const currency = currencyMap[locale];

  const summary = cart.reduce((total, item) => total + item.quantity, 0);

  const total =
    cart.reduce((total, item) => total + item.price * item.quantity, 0) *
    coefficient;

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
        total: total.toFixed(2),
      };

      await fetch("/api/place_order/", {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((data) => data.json());

      setCart([]);
      notyf.notifySuccess(dictionary.cart.order_success);
    } catch (error) {
      notyf.notifyError(dictionary.cart.order_error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto pb-10 lg:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 lg:py-10">
        <h1 className="font-bold uppercase text-3xl lg:text-6xl">
          {dictionary.checkout.checkout}
        </h1>
      </div>

      {cart.length ? (
        <div className="p-10 lg:px-14">
          <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-start relative">
            <form className="w-full lg:basis-1/2" onSubmit={handleSubmit}>
              <p className="font-bold text-xl mb-4">
                {dictionary.cart.customer_details}
              </p>

              <Label className="mb-2 block" htmlFor="first_name">
                {dictionary.cart.first_name} *
              </Label>

              <TextInput
                id="first_name"
                name="first_name"
                value={form.first_name}
                className="mb-4"
                placeholder={dictionary.cart.first_name_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="last_name">
                {dictionary.cart.last_name} *
              </Label>

              <TextInput
                id="last_name"
                name="last_name"
                value={form.last_name}
                className="mb-4"
                placeholder={dictionary.cart.last_name_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="telephone">
                {dictionary.cart.telephone} *
              </Label>

              <TextInput
                id="telephone"
                name="telephone"
                value={form.telephone}
                className="mb-8"
                placeholder={dictionary.cart.telephone_placeholder}
                type="tel"
                onChange={handleFormChange}
                required
              />

              <p className="font-bold text-xl mb-4">
                {dictionary.cart.delivery_details}
              </p>

              <Label className="mb-2 block" htmlFor="country">
                {dictionary.cart.country} *
              </Label>

              <TextInput
                id="country"
                name="country"
                value={form.country}
                className="mb-4"
                placeholder={dictionary.cart.country_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="state">
                {dictionary.cart.state} *
              </Label>

              <TextInput
                id="state"
                name="state"
                value={form.state}
                className="mb-4"
                placeholder={dictionary.cart.state_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="city">
                {dictionary.cart.city} *
              </Label>

              <TextInput
                id="city"
                name="city"
                value={form.city}
                className="mb-4"
                placeholder={dictionary.cart.city_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="address">
                {dictionary.cart.address} *
              </Label>

              <TextInput
                id="address"
                name="address"
                value={form.address}
                className="mb-4"
                placeholder={dictionary.cart.address_placeholder}
                type="text"
                onChange={handleFormChange}
                required
              />

              <Label className="mb-2 block" htmlFor="additional">
                {dictionary.cart.additional}
              </Label>

              <Textarea
                id="additional"
                name="additional"
                value={form.additional}
                className="mb-8"
                placeholder={dictionary.cart.additional}
                onChange={handleFormChange}
                rows={6}
              />

              <p className="mb-4 text-xs">{dictionary.cart.review}</p>

              <Button
                className="w-full bg-zinc-800 hover:bg-zinc-900"
                isProcessing={isLoading}
                disabled={isLoading}
                type="submit"
              >
                {dictionary.cart.place_order}
              </Button>
            </form>

            <div className="flex flex-col p-4 w-full lg:basis-1/2 static lg:sticky top-0 bg-stone-200">
              <p>
                {dictionary.checkout.summary} ({summary})
              </p>

              <HR className="my-4 bg-stone-400" />

              {cart.map((item, index) => (
                <CartItem key={index} item={item} isEditable={false} />
              ))}

              <HR className="my-4 bg-stone-400" />

              <div className="flex items-center justify-between">
                <span className="text-xl">{dictionary.cart.total}:</span>
                <span className="text-xl">{formatPrice(total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 flex flex-col justify-center items-center">
          <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
            {dictionary.cart.empty_cart}
          </h2>

          <p className="text-accent-3 px-10 text-center pt-2">
            {dictionary.cart.add_to_cart}{" "}
            <NavLink href="/category" className="underline hover:no-underline">
              {dictionary.cart.here}
            </NavLink>
          </p>
        </div>
      )}
    </div>
  );
}
