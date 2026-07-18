import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";

export const input = cva(
  "w-full min-h-12 px-3 py-2.5 bg-white text-ink type-body placeholder:text-ink-faint border-2 disabled:bg-muted disabled:border-ink-faint disabled:text-ink-faint disabled:cursor-not-allowed",
  {
    variants: {
      invalid: {
        true: "border-destructive focus-visible:outline-destructive",
        false: "border-input",
      },
    },
    defaultVariants: { invalid: false },
  }
);

export type InputInvalid = NonNullable<VariantProps<typeof input>["invalid"]>;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({
  invalid,
  className,
  type,
  ...rest
}: InputProps): ReactElement {
  return (
    <input
      type={type ?? "text"}
      className={cn(input({ invalid }), className)}
      {...rest}
    />
  );
}
