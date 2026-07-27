import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";

interface MediaFigureProps {
  media: ReactNode;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
}

export function MediaFigure({
  media,
  ariaLabel,
  onClick,
  className,
}: MediaFigureProps): ReactElement {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "relative block w-full aspect-square overflow-hidden border-2 border-ink bg-white p-0 cursor-pointer",
        "[&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-[var(--ease)] hover:[&_img]:scale-[1.03]",
        className
      )}
    >
      {media}
    </button>
  );
}
