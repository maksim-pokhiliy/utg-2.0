"use client";

import { useEffect } from "react";

import { useCartStore } from "@root/store/cart";

export default function CartHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
