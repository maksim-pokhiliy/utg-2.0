import { atom } from "recoil";

import { persistAtom } from "@root/recoil";

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
