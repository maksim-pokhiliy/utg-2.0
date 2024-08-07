"use client";

import React, { ChangeEvent, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Image from "next/image";
import classNames from "classnames";

import { formatPrice } from "@root/utils/formatPrice";

import {
  ICartItem,
  cartState,
  dictionaryState,
  exchangeCoefficientState,
  languageState,
} from "@root/recoil/atoms";

interface CartItemProps {
  item: ICartItem;
  isEditable?: boolean;
}

export const CartItem = ({ item, isEditable = true }: CartItemProps) => {
  const [cart, setCart] = useRecoilState(cartState);

  const dictionary = useRecoilValue(dictionaryState);
  const coefficient = useRecoilValue(exchangeCoefficientState);
  const locale = useRecoilValue(languageState);

  const [quantity, setQuantity] = useState<number>(item.quantity);

  const updateCart = (newQuantity: number) => {
    const newCart = cart.map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCart(newCart);
  };

  const removeFromCart = () => {
    const newCart = cart.filter((cartItem) => cartItem.id !== item.id);

    setCart(newCart);
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);

    if (newQuantity > 0) {
      setQuantity(newQuantity);
      updateCart(newQuantity);
    }
  };

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;

    setQuantity(newQuantity);
    updateCart(newQuantity);
  };

  const decreaseQuantity = () => {
    const newQuantity = Math.max(1, quantity - 1);

    setQuantity(newQuantity);
    updateCart(newQuantity);
  };

  return (
    <li
      className={classNames("flex flex-col", {
        "py-0": !isEditable,
        "py-4": isEditable,
      })}
    >
      <div
        className={classNames("flex flex-row gap-4", {
          "py-4": isEditable,
          "py-2": !isEditable,
        })}
      >
        <div
          className="relative w-[60px] h-[60px] overflow-hidden"
          style={{ paddingBottom: "60px" }}
        >
          <Image
            src={item.image}
            alt={item.title}
            quality={0}
            className="absolute inset-0 w-full h-full object-cover"
            priority
            fill
          />
        </div>

        <div className={classNames("flex-1", { "flex flex-col": !isEditable })}>
          <div
            className={classNames("flex-1 flex text-base", {
              "flex-row justify-between": !isEditable,
              "flex-col": isEditable,
            })}
          >
            <span
              className={classNames("text-gray-500", { "pb-1": isEditable })}
            >
              {item.title}
            </span>

            {!isEditable && (
              <span>
                {formatPrice(item.price * item.quantity * coefficient, locale)}
              </span>
            )}
          </div>

          {isEditable && (
            <span>
              {formatPrice(item.price * item.quantity * coefficient, locale)}
            </span>
          )}

          <div className={classNames({ "mt-3": isEditable })}>
            {isEditable ? (
              <div className="h-7 flex flex-row relative w-16 border-gray-300 border bg-white">
                <label className="w-full">
                  <input
                    className="text-xs px-2 w-full h-full border-0 focus:outline-none select-none pointer-events-auto"
                    onChange={handleQuantityChange}
                    pattern="[0-9]*"
                    aria-label={dictionary.shared.quantity}
                    value={quantity}
                    type="number"
                    min={1}
                  />
                </label>

                <div className="absolute right-1 top-[3px]">
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex p-0.5 items-center justify-center text-black disabled:text-gray-300"
                  >
                    <svg
                      className="w-2 h-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex p-0.5 items-center justify-center text-black disabled:text-gray-500"
                  >
                    <svg
                      className="w-2 h-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <p>
                {dictionary.shared.quantity}: {quantity}
              </p>
            )}
          </div>
        </div>

        {isEditable && (
          <button className="flex" onClick={removeFromCart}>
            <svg
              fill="none"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
};

export default CartItem;
