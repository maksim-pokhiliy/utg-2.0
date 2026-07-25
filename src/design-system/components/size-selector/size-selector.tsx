import { cva } from "class-variance-authority";
import type { ReactElement } from "react";

import { cn } from "../../lib/cn";

const chip = cva(
  "inline-flex items-center justify-center min-w-14 min-h-11 px-[14px] border-2 border-ink cursor-pointer font-mono font-medium text-[0.9375rem] leading-none tracking-[var(--caps-tracking)] uppercase transition-colors duration-200 ease-[var(--ease)]",
  {
    variants: {
      selected: {
        true: "bg-ink text-paper",
        false: "bg-paper text-ink hover:bg-ink hover:text-paper",
      },
    },
    defaultVariants: { selected: false },
  }
);

interface SizeSelectorProps {
  sizes: readonly string[];
  value: string | null;
  onChange: (size: string | null) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  className?: string;
}

export function SizeSelector({
  sizes,
  value,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  className,
}: SizeSelectorProps): ReactElement {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {sizes.map((size) => {
        const isSelected = value === size;

        return (
          <button
            key={size}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(isSelected ? null : size)}
            className={chip({ selected: isSelected })}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
