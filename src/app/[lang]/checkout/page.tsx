import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Spinner } from "flowbite-react";

export const metadata: Metadata = {
  title: "UTG | Checkout",
  description: "Donate and fight with us",
};

const CheckoutScreen = dynamic(
  () => import("@root/components/pages/CheckoutScreen"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-center py-10">
        <Spinner className="fill-zinc-900" size="lg" />
      </div>
    ),
  }
);

export default function About() {
  return <CheckoutScreen />;
}
