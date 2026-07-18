"use client";

import dynamic from "next/dynamic";
import { Spinner } from "flowbite-react";

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

export default function CheckoutClient() {
  return <CheckoutScreen />;
}
