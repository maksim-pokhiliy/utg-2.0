import NotFoundScreen from "@root/components/pages/NotFoundScreen";

import { fontRootStyle } from "./fonts";

import "@root/app/globals.css";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <style href="utg-not-found-fonts" precedence="high">
        {fontRootStyle}
      </style>

      <NotFoundScreen />
    </div>
  );
}
