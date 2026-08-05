"use client";

import type { MouseEvent, ReactElement, Ref } from "react";

import { cn } from "../../lib/cn";

const ROW_CLASS =
  "flex items-center gap-2.5 min-h-11 px-3.5 py-1.5 type-small cursor-pointer";
const EMPTY_CLASS = "px-3.5 py-3 type-caption text-ink-faint";

export function ComboboxEmptyRow({ label }: { label: string }): ReactElement {
  return (
    <div
      role="option"
      aria-selected={false}
      aria-disabled="true"
      className={EMPTY_CLASS}
    >
      {label}
    </div>
  );
}

export interface ComboboxOption {
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
}

interface ComboboxOptionRowProps {
  id: string;
  option: ComboboxOption;
  isActive: boolean;
  optionRef: Ref<HTMLDivElement>;
  onPick: () => void;
  onHover: () => void;
}

export function keepFocus(event: MouseEvent<HTMLDivElement>): void {
  event.preventDefault();
}

export function ComboboxOptionRow({
  id,
  option,
  isActive,
  optionRef,
  onPick,
  onHover,
}: ComboboxOptionRowProps): ReactElement {
  const metaClass = cn(
    "flex-none type-caption",
    isActive ? "text-band-muted" : "text-ink-faint"
  );

  return (
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      ref={optionRef}
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        keepFocus(event);
        onPick();
      }}
      onMouseEnter={onHover}
      className={cn(ROW_CLASS, isActive ? "bg-ink text-paper" : "text-ink")}
    >
      <span className="flex-1 min-w-0">{option.label}</span>
      {option.meta !== undefined ? (
        <span className={metaClass}>{option.meta}</span>
      ) : null}
    </div>
  );
}
