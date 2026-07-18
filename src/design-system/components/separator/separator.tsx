import type { ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const separator = cva("m-0 border-0", {
  variants: {
    weight: {
      hair: "border-t border-line",
      rule: "border-t-2 border-ink",
      heavy: "border-t-4 border-ink",
    },
  },
  defaultVariants: { weight: "rule" },
});

export type SeparatorWeight = NonNullable<
  VariantProps<typeof separator>["weight"]
>;

interface SeparatorProps {
  weight?: SeparatorWeight;
  className?: string;
}

export function Separator({ weight, className }: SeparatorProps): ReactElement {
  return <hr className={cn(separator({ weight }), className)} />;
}
