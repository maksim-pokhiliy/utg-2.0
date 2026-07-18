import type { Metadata } from "next";

import CheckoutScreen from "@root/components/pages/CheckoutScreen";

export const metadata: Metadata = {
  title: "UTG | Checkout",
  description: "Donate and fight with us",
};

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
