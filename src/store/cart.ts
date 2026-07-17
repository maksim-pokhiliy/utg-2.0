import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export const CART_STORAGE_KEY = "utg-cart-v2";

export interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  productUrl: string;
}

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
      return { state: { items: JSON.parse(raw) as ICartItem[] }, version: 0 };
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
          const exists = state.items.some(
            (cartItem) => cartItem.id === item.id
          );

          if (exists) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + item.quantity,
                    }
                  : cartItem
              ),
            };
          }

          return { items: [...state.items, item] };
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
