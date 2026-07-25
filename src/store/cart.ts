"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export const CART_STORAGE_KEY = "utg-cart-v2";

const CART_ID_SEPARATOR = "::";
const CART_TITLE_SEPARATOR = " · ";

export interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  productUrl: string;
}

export interface ICartLineInput {
  slug: string;
  title: string;
  size: string | null;
  price: number;
  quantity: number;
  image: string;
  productUrl: string;
}

export const composeCartLine = ({
  slug,
  title,
  size,
  price,
  quantity,
  image,
  productUrl,
}: ICartLineInput): ICartItem => ({
  id: size === null ? slug : `${slug}${CART_ID_SEPARATOR}${size}`,
  title: size === null ? title : `${title}${CART_TITLE_SEPARATOR}${size}`,
  price,
  quantity,
  image,
  productUrl,
});

interface CartStore {
  items: ICartItem[];
  addItem: (item: ICartItem) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const normalizeQuantity = (quantity: number): number =>
  Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1;

const cartStorage: PersistStorage<Pick<CartStore, "items">> = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(name);

    if (raw === null) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return null;
      }

      const items = parsed.map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity),
      })) as ICartItem[];

      return { state: { items }, version: 0 };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(name, JSON.stringify(value.state.items));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const quantity = normalizeQuantity(item.quantity);
          const exists = state.items.some(
            (cartItem) => cartItem.id === item.id
          );

          if (exists) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: normalizeQuantity(cartItem.quantity + quantity),
                    }
                  : cartItem
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.id === id
              ? { ...cartItem, quantity: normalizeQuantity(quantity) }
              : cartItem
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.id !== id),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: cartStorage,
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);

export const selectItemCount = (state: Pick<CartStore, "items">): number =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectSubtotal = (state: Pick<CartStore, "items">): number =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const useCartHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(() =>
    useCartStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useCartStore.persist.hasHydrated());

    return unsubscribe;
  }, []);

  return hydrated;
};
