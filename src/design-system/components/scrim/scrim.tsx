"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactElement } from "react";

export function Scrim(): ReactElement {
  return (
    <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-scrim data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]" />
  );
}
