import NotFoundScreen from "@root/components/pages/NotFoundScreen";

import { fontVariables } from "./fonts";

import "@root/app/globals.css";

export default function NotFound() {
  return (
    <div
      className={`${fontVariables} bg-background text-foreground flex min-h-screen flex-col`}
    >
      <NotFoundScreen />
    </div>
  );
}
