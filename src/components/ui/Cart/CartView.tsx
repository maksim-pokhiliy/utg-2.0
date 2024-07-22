"use client";

import Image from "next/image";
import { useRecoilState } from "recoil";

import { cartState } from "@root/recoil/atoms";

export default function CartView() {
  const [cart, setCart] = useRecoilState(cartState);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const removeFromCart = (index: number) => {
    const newCart = [...cart];

    newCart.splice(index, 1);

    setCart(newCart);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {cart.length > 0 ? (
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={50}
                  height={50}
                  className="rounded"
                />

                <div className="flex-1 ml-4">
                  <h3 className="text-sm font-bold">{item.title}</h3>

                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </p>

                  <p className="text-sm text-gray-500">Color: {item.color}</p>

                  <div className="flex items-center mt-1">
                    <select
                      value={item.quantity}
                      onChange={(e) => {
                        const newCart = [...cart];
                        newCart[index].quantity = parseInt(e.target.value);
                        setCart(newCart);
                      }}
                      className="border border-gray-300 rounded p-1"
                    >
                      {[1, 2, 3, 4, 5].map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(index)}
                  className="text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M18.36 6.64a1 1 0 00-1.41 0L12 11.59 7.05 6.64a1 1 0 00-1.41 1.41L10.59 13l-4.95 4.95a1 1 0 001.41 1.41L12 14.41l4.95 4.95a1 1 0 001.41-1.41L13.41 13l4.95-4.95a1 1 0 000-1.41z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
              Your cart is empty
            </h2>

            <p className="text-accent-3 px-10 text-center pt-2">
              Add products to your cart in{" "}
              <a href="/category">
                <span>here</span>
              </a>
            </p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="flex-shrink-0 px-6 py-6 border-t bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Subtotal</span>

            <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
          </div>

          <button className="btn-main w-full text-lg">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
