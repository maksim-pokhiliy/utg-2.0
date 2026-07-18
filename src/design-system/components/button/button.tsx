import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2.5 border-2 font-display font-medium leading-none uppercase tracking-[0.05em] cursor-pointer select-none no-underline transition-colors duration-[120ms] ease-[var(--ease)] active:translate-y-px disabled:bg-muted disabled:border-muted disabled:text-ink-faint disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-ink hover:bg-paper hover:text-ink",
        accent:
          "bg-accent text-accent-foreground border-ink hover:bg-ink hover:text-paper",
        outline:
          "bg-transparent text-ink border-ink hover:bg-ink hover:text-paper",
        ghost:
          "bg-transparent text-ink border-transparent hover:bg-muted hover:text-ink",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive-strong hover:border-destructive-strong",
      },
      size: {
        default: "min-h-12 px-7 text-[1.0625rem]",
        sm: "min-h-10 px-4 text-[0.9375rem]",
      },
      block: {
        true: "flex w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "default", size: "default", block: false },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof button>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof button>["size"]>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

export function Button({
  variant,
  size,
  block,
  loading = false,
  asChild = false,
  className,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps): ReactElement {
  const classes = cn(button({ variant, size, block }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="utg-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
