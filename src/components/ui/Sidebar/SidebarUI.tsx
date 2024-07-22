"use client";

import { useRecoilState } from "recoil";

import Sidebar from "@root/components/ui/Sidebar/Sidebar";
import { sidebarState } from "@root/recoil/atoms";
import CartView from "@root/components/ui/Cart/CartView";

export default function SidebarUI() {
  const closeSidebar = () => setDisplaySidebar(false);

  const [displaySidebar, setDisplaySidebar] = useRecoilState(sidebarState);

  return displaySidebar ? (
    <Sidebar onClose={closeSidebar}>
      <CartView />
    </Sidebar>
  ) : null;
}
