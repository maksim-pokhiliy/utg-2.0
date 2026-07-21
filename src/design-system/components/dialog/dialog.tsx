"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { IconButton } from "../icon-button/icon-button";
import { Typography } from "../typography/typography";

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
  "fixed z-[70] focus:outline-none data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]",
  {
    variants: {
      size: {
        panel:
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,calc(100vw-32px))] bg-paper border-2 border-ink",
        full: "inset-0 w-full h-full bg-ink text-band-foreground flex flex-col",
      },
    },
    defaultVariants: { size: "panel" },
  }
);

export type DialogSize = "panel" | "full";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: DialogSize;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  size = "panel",
}: DialogProps): ReactElement {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogOverlay />

        <DialogPrimitive.Content
          className={dialogContent({ size })}
          aria-describedby={undefined}
        >
          {size === "full" ? (
            <>
              <div className="flex items-center justify-between p-(--gutter)">
                <DialogPrimitive.Title asChild>
                  <Typography variant="h3" as="h2">
                    {title}
                  </Typography>
                </DialogPrimitive.Title>

                <DialogPrimitive.Close asChild>
                  <IconButton variant="band" aria-label="Close">
                    <Icon name="x" />
                  </IconButton>
                </DialogPrimitive.Close>
              </div>

              {children}
            </>
          ) : (
            <>
              <div className="bg-band text-band-foreground px-4 py-3">
                <DialogPrimitive.Title asChild>
                  <Typography variant="h3" as="h2">
                    {title}
                  </Typography>
                </DialogPrimitive.Title>
              </div>

              <div className="flex flex-col gap-5 p-4">
                {children}

                {actions ? (
                  <div className="flex justify-end gap-2">{actions}</div>
                ) : null}
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
