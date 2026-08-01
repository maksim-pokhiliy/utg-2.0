"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

import { cn } from "../../lib/cn";

export function Scrim({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>): ReactElement {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[60] bg-scrim data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]",
        className
      )}
      {...props}
    />
  );
}
