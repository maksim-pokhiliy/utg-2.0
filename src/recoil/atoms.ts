import { atom } from "recoil";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

export const cartState = atom<CartItem[]>({
  key: "cartState",
  default: [],
});

export const sidebarState = atom({
  key: "sidebarState",
  default: false,
});
