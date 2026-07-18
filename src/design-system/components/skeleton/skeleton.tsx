import type { ReactElement } from "react";

import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): ReactElement {
  return (
    <div
      className={cn(
        "bg-muted animate-[utg-pulse_1.4s_var(--ease)_infinite]",
        className
      )}
      aria-hidden="true"
    />
  );
}
