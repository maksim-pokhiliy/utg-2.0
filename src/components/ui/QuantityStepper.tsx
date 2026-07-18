"use client";

import { useEffect, useState, type ChangeEvent } from "react";

interface QuantityStepperProps {
  value: number;
  onChange: (quantity: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export default function QuantityStepper({
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: QuantityStepperProps) {
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

  return (
    <div className="h-7 flex flex-row relative w-16 border-gray-300 border bg-white">
      <label className="w-full">
        <input
          className="text-xs px-2 w-full h-full border-0 focus:outline-none select-none pointer-events-auto"
          onChange={handleChange}
          onBlur={commit}
          pattern="[0-9]*"
          aria-label={ariaLabel}
          value={draft}
          type="number"
          min={1}
          disabled={disabled}
        />
      </label>

      <div className="absolute right-1 top-[3px]">
        <button
          type="button"
          onClick={increase}
          disabled={disabled}
          className="flex p-0.5 items-center justify-center text-black disabled:text-gray-300"
        >
          <svg
            className="w-2 h-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={decrease}
          disabled={disabled}
          className="flex p-0.5 items-center justify-center text-black disabled:text-gray-300"
        >
          <svg
            className="w-2 h-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
