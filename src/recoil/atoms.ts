import { atom } from "recoil";

import { persistAtom } from "@root/recoil";
import { currencyMap } from "@root/utils/formatPrice";

export interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export const cartState = atom<ICartItem[]>({
  key: "cartState",
  default: [],
  effects_UNSTABLE: [persistAtom],
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
