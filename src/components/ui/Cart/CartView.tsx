"use client";

import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  cartState,
  dictionaryState,
  exchangeCoefficientState,
  languageState,
  sidebarState,
} from "@root/recoil/atoms";

import CartItem from "@root/components/ui/Cart/CartItem";
import { NavLink } from "@root/components/layout/NavBar/NavLink";
import { formatPrice } from "@root/utils/formatPrice";

export const CartView = () => {
  const cart = useRecoilValue(cartState);
  const dictionary = useRecoilValue(dictionaryState);
  const coefficient = useRecoilValue(exchangeCoefficientState);
  const locale = useRecoilValue(languageState);

  const setIsSidebarOpen = useSetRecoilState(sidebarState);

  const closeSidebar = () => setIsSidebarOpen(false);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col text-base bg-accent-0 shadow-xl overflow-y-auto overflow-x-hidden">
      <div className="relative bg-black">
        <button
          onClick={closeSidebar}
          aria-label="Close"
          className="hover:text-accent-5 absolute transition ease-in-out duration-150 focus:outline-none mr-6 top-[32px]"
        >
          <svg
            className="w-6 h-6 text-site ml-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        <span className="font-bold text-2xl text-center text-white block p-6">
          {dictionary.cart}
        </span>
      </div>

      {cart.length ? (
        <div>
          <div className="flex-1">
            <ul className="sm:px-6 p-4 space-y-6 sm:py-0 sm:space-y-0 sm:divide-y sm:divide-accent-2 border-accent-2">
              {cart.map((item, index) => (
                <CartItem key={index} item={item} />
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 border-t text-md bg-site">
            <ul className="pb-2">
              <li className="flex justify-between py-1">
                <span>{dictionary.total}</span>

                <span>{formatPrice(subtotal * coefficient, locale)}</span>
              </li>
            </ul>

            <div>
              <button className="btn-main w-full text-lg">
                {dictionary.proceed}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 flex flex-col justify-center items-center">
          <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
            {dictionary.empty_cart}
          </h2>

          <p className="text-accent-3 px-10 text-center pt-2">
            {dictionary.add_to_cart}{" "}
            <NavLink href="/category" className="underline hover:no-underline">
              {dictionary.here}
            </NavLink>
          </p>
        </div>
      )}
    </div>
  );
};

export default CartView;
