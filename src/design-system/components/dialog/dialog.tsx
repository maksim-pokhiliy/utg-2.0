"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

import { cn } from "../../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

function DialogOverlay({
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

const dialogContent = cva(
  "fixed z-[70] bg-paper border-2 border-ink focus:outline-none",
  {
    variants: {
      size: {
        panel:
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,calc(100vw-32px))] data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]",
        full: "inset-0 w-full h-full border-0 data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]",
      },
    },
    defaultVariants: { size: "panel" },
  }
);

export type DialogSize = NonNullable<
  VariantProps<typeof dialogContent>["size"]
>;

interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: DialogSize;
}

export function DialogContent({
  size,
  className,
  children,
  ...props
}: DialogContentProps): ReactElement {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(dialogContent({ size }), className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
