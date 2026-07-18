import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  required = false,
  helper,
  error,
  className,
  children,
}: FieldProps): ReactElement {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="type-caption text-ink">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>

      {children}

      {helper && !error ? (
        <span className="type-small text-ink-faint">{helper}</span>
      ) : null}

      {error ? (
        <span className="type-small font-medium text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
