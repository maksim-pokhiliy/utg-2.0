import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";

const iconButton = cva(
  "inline-flex items-center justify-center relative w-11 h-11 border-2 border-transparent bg-transparent cursor-pointer active:translate-y-px",
  {
    variants: {
      variant: {
        default: "text-ink hover:bg-muted",
        band: "text-band-foreground hover:bg-band-hover",
        box: "text-ink border-ink hover:bg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type IconButtonVariant = NonNullable<
  VariantProps<typeof iconButton>["variant"]
>;

const INERT_TREATMENT = "opacity-35 pointer-events-none";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-disabled"> {
  variant?: IconButtonVariant;
  inert?: boolean;
  "aria-label": string;
}

export function IconButton({
  variant,
  className,
  children,
  type,
  inert,
  ...rest
}: IconButtonProps): ReactElement {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        iconButton({ variant }),
        inert === true && INERT_TREATMENT,
        className
      )}
      {...rest}
      aria-disabled={inert}
    >
      {children}
    </button>
  );
}
