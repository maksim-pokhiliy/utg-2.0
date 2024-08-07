"use client";

import { Spinner } from "flowbite-react";
import dynamic from "next/dynamic";

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
