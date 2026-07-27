import type { Metadata } from "next";

import NotFoundScreen from "@root/components/pages/NotFoundScreen";

import { fontRootStyle } from "./fonts";

import "@root/app/globals.css";

export const metadata: Metadata = {
  title: "UTG | 404",
};

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <style href="utg-not-found-fonts" precedence="high">
        {fontRootStyle}
      </style>

      <main className="flex-1">
        <NotFoundScreen />
      </main>
    </div>
  );
}
