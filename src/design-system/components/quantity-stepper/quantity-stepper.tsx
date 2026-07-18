"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

interface QuantityStepperProps {
  value: number;
  onChange: (quantity: number) => void;
  ariaLabel: string;
  disabled?: boolean;
  size?: "default" | "sm";
}

export function QuantityStepper({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  size = "default",
}: QuantityStepperProps): ReactElement {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    setDraft(next);

    const parsed = parseInt(next, 10);

    if (Number.isInteger(parsed) && parsed >= 1) {
      onChange(parsed);
    }
  };

  const commit = () => {
    const parsed = parseInt(draft, 10);

    if (Number.isInteger(parsed) && parsed >= 1) {
      onChange(parsed);
      setDraft(String(parsed));
    } else {
      setDraft(String(value));
    }
  };

  const increase = () => onChange(value + 1);

  const decrease = () => onChange(Math.max(1, value - 1));

  const isSmall = size === "sm";

  const stepButton = cn(
    "inline-flex items-center justify-center min-h-11 w-11 p-0 bg-transparent text-ink cursor-pointer hover:bg-muted disabled:text-line disabled:cursor-not-allowed disabled:bg-transparent",
    isSmall && "min-h-10 w-10"
  );

  return (
    <div className="inline-flex items-stretch border-2 border-ink bg-white">
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= 1}
        aria-label={`${ariaLabel} −`}
        className={stepButton}
      >
        <Icon name="minus" size={20} />
      </button>

      <input
        className={cn(
          "text-center border-x border-line type-price bg-transparent text-ink p-0",
          isSmall ? "w-9" : "w-11"
        )}
        onChange={handleChange}
        onBlur={commit}
        pattern="[0-9]*"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={draft}
        type="number"
        min={1}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={increase}
        disabled={disabled}
        aria-label={`${ariaLabel} +`}
        className={stepButton}
      >
        <Icon name="plus" size={20} />
      </button>
    </div>
  );
}
