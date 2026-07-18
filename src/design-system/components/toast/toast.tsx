"use client";

import type { ReactElement, ReactNode } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

type ToastVariant = "success" | "error";

function ToastCard({
  variant,
  children,
}: {
  variant: ToastVariant;
  children: ReactNode;
}): ReactElement {
  const isError = variant === "error";

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 border-2 type-small w-[min(400px,calc(100vw-32px))]",
        isError
          ? "bg-destructive border-destructive text-white"
          : "bg-ink border-ink text-paper"
      )}
    >
      <Icon
        name={isError ? "x" : "check"}
        size={20}
        className={cn(
          "shrink-0 mt-px",
          isError ? "text-white" : "text-flag-yellow"
        )}
      />
      <span>{children}</span>
    </div>
  );
}

export const toast = {
  success: (message: string): string | number =>
    sonnerToast.custom(() => (
      <ToastCard variant="success">{message}</ToastCard>
    )),
  error: (message: string): string | number =>
    sonnerToast.custom(() => <ToastCard variant="error">{message}</ToastCard>),
};

export function Toaster(): ReactElement {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{ unstyled: true, duration: 6000 }}
    />
  );
}
