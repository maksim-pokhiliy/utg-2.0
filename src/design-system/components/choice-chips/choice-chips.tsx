"use client";

import { cva } from "class-variance-authority";
import { useRef, type KeyboardEvent, type ReactElement } from "react";

import { cn } from "../../lib/cn";

const chip = cva(
  "inline-flex items-center justify-center min-h-11 px-4 border-2 border-ink cursor-pointer font-mono font-medium text-[0.8125rem] leading-none tracking-[var(--caps-tracking)] uppercase transition-colors duration-200 ease-[var(--ease)] disabled:opacity-55 disabled:cursor-not-allowed",
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

function nextIndex(key: string, index: number, count: number): number | null {
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (index + 1) % count;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (index - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return null;
}

export interface ChoiceChipOption {
  readonly id: string;
  readonly label: string;
}

interface ChoiceChipsProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: readonly ChoiceChipOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChoiceChips({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className,
}: ChoiceChipsProps): ReactElement {
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void => {
    const isModified =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

    if (isModified || event.defaultPrevented) {
      return;
    }

    const next = nextIndex(event.key, index, options.length);

    if (next === null || next < 0 || next >= options.length) {
      return;
    }

    event.preventDefault();
    onChange(options[next].id);
    chipRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <span className="type-caption text-ink">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={option.id}
            ref={(node) => {
              chipRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={index === selectedIndex}
            disabled={disabled}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={chip({ selected: index === selectedIndex })}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
