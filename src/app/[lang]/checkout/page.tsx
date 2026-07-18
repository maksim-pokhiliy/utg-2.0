import type { Metadata } from "next";

import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "UTG | Checkout",
  description: "Donate and fight with us",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
