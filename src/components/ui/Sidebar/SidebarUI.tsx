"use client";

import Sidebar from "@root/components/ui/Sidebar/Sidebar";
import CartView from "@root/components/ui/Cart/CartView";
import { useSidebarStore } from "@root/store/sidebar";

export default function SidebarUI() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  return isOpen ? (
    <Sidebar onClose={close}>
      <CartView />
    </Sidebar>
  ) : null;
}
