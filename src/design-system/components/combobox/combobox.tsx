"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import { Field } from "../field/field";
import { Icon } from "../icon/icon";
import { Input } from "../input/input";
import { Skeleton } from "../skeleton/skeleton";
import {
  ComboboxEmptyRow,
  ComboboxOptionRow,
  keepFocus,
  type ComboboxOption,
} from "./combobox-option";

const DEBOUNCE_MS = 250;
const BLUR_GRACE_MS = 140;
const CHEVRON_SIZE = 18;
const PANEL_KEYS = ["Escape", "ArrowDown", "ArrowUp", "Enter"];
const BAR_CLASSES = ["h-3.5 w-[60%]", "h-3.5 w-[45%]", "h-3.5 w-[70%]"];

type SearchPhase = "idle" | "pending" | "awaiting";
type TimerRef = { current: ReturnType<typeof setTimeout> | null };

function clearTimer(ref: TimerRef): void {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

export type { ComboboxOption };

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
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeOptionRef = useRef<HTMLDivElement | null>(null);
  const isKeyboardMoveRef = useRef(false);
  const latestOptionsRef = useRef(options);
  const dispatchedOptionsRef = useRef<readonly ComboboxOption[] | null>(null);

  const hasError = Boolean(error);
  const isBusy = phase !== "idle" || loading;
  const isPanelOpen = isOpen && !disabled;
  const safeIndex = Math.max(-1, Math.min(activeIndex, options.length - 1));
  const isListVisible = isPanelOpen && !isBusy && options.length > 0;
  const rowId = (index: number): string => `${id}-option-${index}`;

  const dismiss = useCallback((): void => {
    clearTimer(debounceRef);
    setPhase("idle");
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (safeIndex >= 0 && isKeyboardMoveRef.current) {
      isKeyboardMoveRef.current = false;
      activeOptionRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [safeIndex]);

  useEffect(() => {
    if (options !== latestOptionsRef.current) {
      latestOptionsRef.current = options;
      setActiveIndex(0);
    }

    const isAcknowledged =
      loading || options !== dispatchedOptionsRef.current || value.length === 0;

    if (phase === "awaiting" && isAcknowledged) {
      setPhase("idle");
    }
  }, [loading, options, phase, value]);

  useEffect(() => {
    if (disabled) {
      dismiss();
    }
  }, [disabled, dismiss]);

  useEffect(() => {
    return () => {
      clearTimer(debounceRef);
      clearTimer(blurRef);
    };
  }, []);

  const scheduleSearch = (query: string): void => {
    clearTimer(debounceRef);
    setPhase("pending");
    setIsOpen(true);
    setActiveIndex(0);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      dispatchedOptionsRef.current = latestOptionsRef.current;
      setPhase("awaiting");
      onSearch(query);
    }, DEBOUNCE_MS);
  };

  const moveActive = (step: number): void => {
    const next = Math.max(0, Math.min(safeIndex + step, options.length - 1));

    if (next !== safeIndex) {
      isKeyboardMoveRef.current = true;
      setActiveIndex(next);
    }
  };

  const pick = (option: ComboboxOption): void => {
    clearTimer(blurRef);
    setIsOpen(false);
    setActiveIndex(0);
    onSelect(option);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onValueChange(event.target.value);
    scheduleSearch(event.target.value);
  };

  const handleFocus = (): void => {
    clearTimer(blurRef);
    scheduleSearch(value);
  };

  const openPanel = (): void => {
    if (!disabled && !isOpen) {
      clearTimer(blurRef);
      setIsOpen(true);
      setActiveIndex(0);
    }
  };

  const handleBlur = (): void => {
    clearTimer(blurRef);
    blurRef.current = setTimeout(dismiss, BLUR_GRACE_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const isModified =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

    if (
      isModified ||
      event.defaultPrevented ||
      !PANEL_KEYS.includes(event.key)
    ) {
      return;
    }

    if (!isPanelOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openPanel();
      }

      return;
    }

    event.preventDefault();

    if (event.key === "Escape") {
      dismiss();
    } else if (!isListVisible) {
      return;
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      pick(options[safeIndex]);
    }
  };

  const renderRow = (option: ComboboxOption, index: number): ReactElement => (
    <ComboboxOptionRow
      key={option.id}
      id={rowId(index)}
      option={option}
      isActive={index === safeIndex}
      optionRef={index === safeIndex ? activeOptionRef : null}
      onPick={() => pick(option)}
      onHover={() => {
        isKeyboardMoveRef.current = false;
        setActiveIndex(index);
      }}
    />
  );

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
          aria-activedescendant={isListVisible ? rowId(safeIndex) : undefined}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onClick={openPanel}
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
            aria-busy={isBusy}
            onMouseDown={keepFocus}
            className="absolute top-full inset-x-0 -mt-0.5 z-30 max-h-[220px] overflow-y-auto border-2 border-ink bg-paper"
          >
            {isBusy ? (
              <div className="flex flex-col gap-2.5 px-3.5 py-2.5">
                {BAR_CLASSES.map((bar) => (
                  <Skeleton key={bar} className={bar} />
                ))}
              </div>
            ) : options.length === 0 ? (
              <ComboboxEmptyRow label={emptyLabel} />
            ) : (
              options.map(renderRow)
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
