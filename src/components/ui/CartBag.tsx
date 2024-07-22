"use client";

import { useRecoilState, useRecoilValue } from "recoil";

import { cartState, sidebarState } from "@root/recoil/atoms";

export default function CartBag() {
  const [isSidebarOpen, setIsSidebarOpen] = useRecoilState(sidebarState);
  const cart = useRecoilValue(cartState);

  const itemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <button
      onClick={toggleSidebar}
      className="flex relative"
      aria-label={`Cart items: ${itemsCount}`}
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {itemsCount > 0 && (
        <span className="font-bold text-xs absolute top-[13px] right-[15px]">
          {itemsCount}
        </span>
      )}
    </button>
  );
}
