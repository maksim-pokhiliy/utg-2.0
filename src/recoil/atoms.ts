import { atom, AtomEffect } from "recoil";

import { currencyMap } from "@root/utils/formatPrice";
import { CART_STATE_KEY } from "@root/utils/constants/recoil";

export interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

const loadStateFromLocalStorage =
  <T>(key: string): AtomEffect<T> =>
  ({ setSelf }) => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(key);

      if (savedState !== null) {
        setSelf(JSON.parse(savedState));
      }
    }
  };

const saveStateToLocalStorage =
  <T>(key: string): AtomEffect<T> =>
  ({ onSet }) => {
    if (typeof window !== "undefined") {
      onSet((newState) => {
        localStorage.setItem(key, JSON.stringify(newState));
      });
    }
  };

export const cartState = atom<ICartItem[]>({
  key: CART_STATE_KEY,
  default: [],
  effects: [
    loadStateFromLocalStorage<ICartItem[]>(CART_STATE_KEY),
    saveStateToLocalStorage<ICartItem[]>(CART_STATE_KEY),
  ],
});

export const sidebarState = atom({
  key: "sidebarState",
  default: false,
});

export const languageState = atom<keyof typeof currencyMap>({
  key: "languageState",
  default: "uk",
});

export const dictionaryState = atom<Record<string, Record<string, string>>>({
  key: "dictionaryState",
  default: {},
});

export const exchangeRatesState = atom<Record<string, number>>({
  key: "exchangeRatesState",
  default: {},
});

export const exchangeCoefficientState = atom<number>({
  key: "exchangeCoefficientState",
  default: 0,
});
