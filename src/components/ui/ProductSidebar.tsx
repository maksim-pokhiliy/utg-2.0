import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { IProduct } from "@root/types";
import { formatPrice } from "@root/utils/formatPrice";

import {
  cartState,
  dictionaryState,
  exchangeCoefficientState,
  ICartItem,
  languageState,
} from "@root/recoil/atoms";

interface IProductSidebarProps {
  product: IProduct;
}

export default function ProductSidebar({ product }: IProductSidebarProps) {
  const [cart, setCart] = useRecoilState(cartState);

  const dictionary = useRecoilValue(dictionaryState);
  const coefficient = useRecoilValue(exchangeCoefficientState);
  const locale = useRecoilValue(languageState);

  const [quantity, setQuantity] = useState<number>(1);

  const addToCart = () => {
    if (!product) {
      return;
    }

    const newCartItem: ICartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      image: product.image,
      productUrl: window.location.href,
    };

    const existingItemIndex =
      cart.findIndex((item) => item.id === product.id) ?? -1;

    if (existingItemIndex >= 0) {
      const newCart = [...cart];

      newCart[existingItemIndex].quantity += quantity;

      setCart(newCart);
    } else {
      setCart([...cart, newCartItem]);
    }

    setQuantity(1);
  };

  return (
    <div className="mb-6">
      <h2 className="max-w-full w-full leading-extra-loose text-3xl tracking-wide leading-8 py-1 mt-4">
        {product.title}
      </h2>

      <p className="text-md font-semibold inline-block tracking-wide py-1">
        {formatPrice(product.price * coefficient, locale)}
      </p>

      <div className="mt-4 mb-6">
        <span className="text-xs tracking-wide">
          {dictionary.shared.quantity}
        </span>

        <div className="mt-2">
          <div className="h-7 flex flex-row relative w-16 border-gray-300 border bg-white">
            <label className="w-full">
              <input
                className="text-xs px-2 w-full h-full border-0 focus:outline-none select-none pointer-events-auto"
                onChange={(e) => setQuantity(Number(e.target.value))}
                pattern="[0-9]*"
                aria-label={dictionary.shared.quantity}
                value={quantity}
                type="number"
                min={1}
                disabled={!product.availability}
              />
            </label>

            <div className="absolute right-1 top-[3px]">
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex p-0.5 items-center justify-center text-black disabled:text-gray-300"
                disabled={!product.availability}
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex p-0.5 items-center justify-center text-black disabled:text-gray-300"
                disabled={!product.availability}
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
        </div>
      </div>

      {product.availability ? (
        <div>
          <button
            aria-label={dictionary.product.add}
            className="btn-main w-full my-1 rounded-2xl"
            type="button"
            onClick={addToCart}
          >
            {dictionary.product.add}
          </button>
        </div>
      ) : null}
    </div>
  );
}
