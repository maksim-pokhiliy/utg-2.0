"use client";

import Image from "next/image";
import classNames from "classnames";

import { formatPrice } from "@root/utils/formatPrice";
import { useCartStore, type ICartItem } from "@root/store/cart";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import QuantityStepper from "@root/components/ui/QuantityStepper";

interface CartItemProps {
  item: ICartItem;
  isEditable?: boolean;
}

export const CartItem = ({ item, isEditable = true }: CartItemProps) => {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

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
                {formatPrice(item.price * item.quantity, money, locale)}
              </span>
            )}
          </div>

          {isEditable && (
            <span>
              {formatPrice(item.price * item.quantity, money, locale)}
            </span>
          )}

          <div className={classNames({ "mt-3": isEditable })}>
            {isEditable ? (
              <QuantityStepper
                value={item.quantity}
                onChange={(quantity) => setQuantity(item.id, quantity)}
                ariaLabel={dictionary.shared.quantity}
              />
            ) : (
              <p>
                {dictionary.shared.quantity}: {item.quantity}
              </p>
            )}
          </div>
        </div>

        {isEditable && (
          <button className="flex" onClick={() => removeItem(item.id)}>
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
