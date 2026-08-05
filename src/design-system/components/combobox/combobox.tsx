"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

import { cn } from "../../lib/cn";
import { Field } from "../field/field";
import { Icon } from "../icon/icon";
import { Input } from "../input/input";
import { Skeleton } from "../skeleton/skeleton";

const DEBOUNCE_MS = 250;
const BLUR_GRACE_MS = 140;
const CHEVRON_SIZE = 18;
const LOADING_BAR_WIDTHS = ["w-[60%]", "w-[45%]", "w-[70%]"];

type TimerRef = { current: ReturnType<typeof setTimeout> | null };

function clearTimer(ref: TimerRef): void {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface ComboboxOption {
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
}

interface ComboboxProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (next: string) => void;
  onSearch: (query: string) => void;
  onSelect: (option: ComboboxOption) => void;
  options: readonly ComboboxOption[];
  emptyLabel: string;
  loading: boolean;
  listboxLabel?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Combobox({
  id,
  label,
  value,
  onValueChange,
  onSearch,
  onSelect,
  options,
  emptyLabel,
  loading,
  listboxLabel,
  placeholder,
  required = false,
  disabled = false,
  error,
  className,
}: ComboboxProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeOptionRef = useRef<HTMLDivElement | null>(null);
  const isKeyboardMoveRef = useRef(false);

  const hasError = Boolean(error);
  const isBusy = isPending || loading;
  const isPanelOpen = isOpen && !disabled;
  const safeIndex =
    options.length === 0 ? -1 : clamp(activeIndex, 0, options.length - 1);
  const isListVisible = isPanelOpen && !isBusy && options.length > 0;
  const isEmptyShown = isPanelOpen && !isBusy && options.length === 0;
  const activeOptionId = isListVisible
    ? `${id}-option-${safeIndex}`
    : undefined;

  useEffect(() => {
    if (safeIndex >= 0 && isKeyboardMoveRef.current) {
      isKeyboardMoveRef.current = false;
      activeOptionRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [safeIndex]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      setActiveIndex(0);
    }
  }, [disabled]);

  useEffect(() => {
    return () => {
      clearTimer(debounceRef);
      clearTimer(blurRef);
    };
  }, []);

  const scheduleSearch = (query: string): void => {
    clearTimer(debounceRef);
    setIsPending(true);
    setIsOpen(true);
    setActiveIndex(0);
    debounceRef.current = setTimeout(() => {
      setIsPending(false);
      onSearch(query);
    }, DEBOUNCE_MS);
  };

  const moveActive = (next: number): void => {
    if (next === safeIndex) {
      return;
    }

    isKeyboardMoveRef.current = true;
    setActiveIndex(next);
  };

  const pick = (option: ComboboxOption): void => {
    clearTimer(blurRef);
    setIsOpen(false);
    setActiveIndex(0);
    onSelect(option);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value;
    onValueChange(next);
    scheduleSearch(next);
  };

  const handleFocus = (): void => {
    clearTimer(blurRef);
    scheduleSearch(value);
  };

  const handleBlur = (): void => {
    clearTimer(blurRef);
    blurRef.current = setTimeout(() => setIsOpen(false), BLUR_GRACE_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const isModified =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

    if (isModified || event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape" && isPanelOpen) {
      event.preventDefault();
      clearTimer(debounceRef);
      setIsPending(false);
      setIsOpen(false);
      setActiveIndex(0);
    } else if (event.key === "ArrowDown" && !isPanelOpen) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
    } else if (event.key === "ArrowDown" && isListVisible) {
      event.preventDefault();
      moveActive(Math.min(safeIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp" && isListVisible) {
      event.preventDefault();
      moveActive(Math.max(safeIndex - 1, 0));
    } else if (event.key === "Enter" && isListVisible) {
      event.preventDefault();
      pick(options[safeIndex]);
    }
  };

  const renderRow = (option: ComboboxOption, index: number): ReactElement => {
    const isActive = index === safeIndex;
    const metaClass = cn(
      "flex-none type-caption",
      isActive ? "text-band-muted" : "text-ink-faint"
    );

    return (
      <div
        key={option.id}
        id={`${id}-option-${index}`}
        role="option"
        aria-selected={isActive}
        ref={isActive ? activeOptionRef : null}
        onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          event.preventDefault();
          pick(option);
        }}
        onMouseEnter={() => {
          isKeyboardMoveRef.current = false;
          setActiveIndex(index);
        }}
        className={cn(
          "flex items-center gap-2.5 min-h-11 px-3.5 py-1.5 type-small cursor-pointer",
          isActive ? "bg-ink text-paper" : "text-ink"
        )}
      >
        <span className="flex-1 min-w-0">{option.label}</span>
        {option.meta !== undefined ? (
          <span className={metaClass}>{option.meta}</span>
        ) : null}
      </div>
    );
  };

  return (
    <Field
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      className={className}
    >
      <div className="relative block">
        <Input
          id={id}
          role="combobox"
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={isPanelOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          invalid={hasError}
          className="pr-10"
        />
        <Icon
          name="chevron-down"
          size={CHEVRON_SIZE}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-faint"
        />
        {isPanelOpen ? (
          <div
            id={`${id}-listbox`}
            role="listbox"
            aria-label={listboxLabel ?? label}
            className="absolute top-full inset-x-0 -mt-0.5 z-30 max-h-[220px] overflow-y-auto border-2 border-ink bg-paper"
          >
            {isBusy ? (
              <div className="flex flex-col gap-2.5 px-3.5 py-2.5">
                {LOADING_BAR_WIDTHS.map((width) => (
                  <Skeleton key={width} className={cn("h-3.5", width)} />
                ))}
              </div>
            ) : isEmptyShown ? (
              <div className="px-3.5 py-3 type-caption text-ink-faint">
                {emptyLabel}
              </div>
            ) : (
              options.map(renderRow)
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
