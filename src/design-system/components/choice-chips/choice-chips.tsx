"use client";

import { cva } from "class-variance-authority";
import { useId, useRef, type KeyboardEvent, type ReactElement } from "react";

import { Field } from "../field/field";

const chip = cva(
  "inline-flex items-center justify-center min-h-11 px-4 border-2 border-ink cursor-pointer font-mono font-medium text-[0.8125rem] leading-none tracking-[var(--caps-tracking)] uppercase transition-colors duration-200 ease-[var(--ease)] disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none aria-disabled:opacity-55 aria-disabled:cursor-not-allowed",
  {
    variants: {
      selected: {
        true: "bg-ink text-paper",
        false: "bg-paper text-ink",
      },
      unavailable: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        selected: false,
        unavailable: false,
        class: "hover:bg-ink hover:text-paper",
      },
    ],
    defaultVariants: { selected: false, unavailable: false },
  }
);

function nextIndex(key: string, index: number, count: number): number | null {
  if (count === 0) {
    return null;
  }
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
  readonly disabled?: boolean;
}

interface ChoiceChipsProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: readonly ChoiceChipOption[];
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChoiceChips({
  label,
  value,
  onChange,
  options,
  helper,
  required = false,
  disabled = false,
  className,
}: ChoiceChipsProps): ReactElement {
  const captionId = useId();
  const helperId = `${captionId}-helper`;
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const firstEnabledIndex = options.findIndex(
    (option) => option.disabled !== true
  );
  const tabbableIndex =
    selectedIndex >= 0 ? selectedIndex : Math.max(firstEnabledIndex, 0);
  const hasHelper = helper !== undefined && helper !== "";

  const nextEnabledIndex = (key: string, index: number): number | null => {
    let candidate = nextIndex(key, index, options.length);

    for (let step = 0; step < options.length; step += 1) {
      if (candidate === null || options[candidate].disabled !== true) {
        return candidate;
      }

      candidate = nextIndex(
        key === "Home" ? "ArrowRight" : key === "End" ? "ArrowLeft" : key,
        candidate,
        options.length
      );
    }

    return null;
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void => {
    const isModified =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    if (isModified || event.defaultPrevented) {
      return;
    }
    const next = nextEnabledIndex(event.key, index);
    if (next === null) {
      return;
    }
    event.preventDefault();
    onChange(options[next].id);
    chipRefs.current[next]?.focus();
  };

  return (
    <Field
      label={label}
      labelId={captionId}
      role="radiogroup"
      required={required}
      disabled={disabled}
      helper={helper}
      helperId={helperId}
      className={className}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isUnavailable = option.disabled === true;

          return (
            <button
              key={option.id}
              ref={(node) => {
                chipRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={index === selectedIndex}
              aria-disabled={isUnavailable || undefined}
              aria-describedby={
                isUnavailable && hasHelper ? helperId : undefined
              }
              disabled={disabled}
              tabIndex={index === tabbableIndex ? 0 : -1}
              onClick={() => {
                if (!isUnavailable) {
                  onChange(option.id);
                }
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={chip({
                selected: index === selectedIndex,
                unavailable: isUnavailable,
              })}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}
