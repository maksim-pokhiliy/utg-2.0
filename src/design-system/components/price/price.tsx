import type { ReactElement, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const price = cva("", {
  variants: {
    size: {
      default: "type-price",
      big: "type-price-big",
    },
    muted: {
      true: "text-ink-faint",
      false: "",
    },
  },
  defaultVariants: { size: "default", muted: false },
});

export type PriceSize = NonNullable<VariantProps<typeof price>["size"]>;

interface PriceProps {
  size?: PriceSize;
  muted?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Price({
  size,
  muted,
  className,
  children,
}: PriceProps): ReactElement {
  return (
    <span className={cn(price({ size, muted }), className)}>{children}</span>
  );
}
