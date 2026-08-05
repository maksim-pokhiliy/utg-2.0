import { cva } from "class-variance-authority";
import type { ReactElement } from "react";

import { cn } from "../../lib/cn";

const skeleton = cva(
  "bg-muted pointer-events-none transition-opacity duration-300",
  {
    variants: {
      settled: {
        true: "opacity-0 animate-none",
        false: "opacity-100 animate-[utg-pulse_1.4s_var(--ease)_infinite]",
      },
    },
    defaultVariants: { settled: false },
  }
);

interface SkeletonProps {
  settled?: boolean;
  className?: string;
}

export function Skeleton({ settled, className }: SkeletonProps): ReactElement {
  return (
    <div className={cn(skeleton({ settled }), className)} aria-hidden="true" />
  );
}
