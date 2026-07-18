"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

import { cn } from "../../lib/cn";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = SheetPrimitive.Title;
export const SheetDescription = SheetPrimitive.Description;

function SheetOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>): ReactElement {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[60] bg-scrim data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]",
        className
      )}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SheetPrimitive.Content>): ReactElement {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[70] flex flex-col w-[min(420px,100vw)] bg-paper border-l-2 border-ink focus:outline-none",
          "data-[state=open]:animate-[utg-slide-in-right_200ms_var(--ease)] data-[state=closed]:animate-[utg-slide-out-right_200ms_var(--ease)]",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
