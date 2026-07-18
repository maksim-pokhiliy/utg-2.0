import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";

const textTab = cva(
  "type-caption inline-flex items-center px-0.5 py-1 bg-transparent border-b-2 cursor-pointer transition-colors duration-[120ms] ease-[var(--ease)]",
  {
    variants: {
      active: {
        true: "text-ink border-flag-yellow",
        false: "text-ink-faint border-transparent hover:text-ink",
      },
    },
    defaultVariants: { active: false },
  }
);

interface TextTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function TextTab({
  active,
  className,
  type,
  children,
  ...rest
}: TextTabProps): ReactElement {
  return (
    <button
      type={type ?? "button"}
      aria-current={active ? "true" : undefined}
      className={cn(textTab({ active }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
