import type { ReactElement, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const badge = cva(
  "inline-flex items-center gap-1.5 type-caption px-2 py-[5px] border whitespace-nowrap",
  {
    variants: {
      variant: {
        in: "bg-accent text-accent-foreground border-transparent",
        out: "bg-muted text-ink-muted border-transparent",
        line: "border-ink text-ink",
        band: "border-band-muted text-band-foreground",
      },
    },
    defaultVariants: { variant: "in" },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badge>["variant"]>;

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}

export function Badge({
  variant,
  className,
  children,
}: BadgeProps): ReactElement {
  return <span className={cn(badge({ variant }), className)}>{children}</span>;
}
