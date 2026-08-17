import type { AriaRole, ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";

const CAPTION = "type-caption text-ink";

interface FieldProps {
  label: string;
  htmlFor?: string;
  labelId?: string;
  role?: AriaRole;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
  helperId?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  labelId,
  role,
  required = false,
  disabled = false,
  helper,
  helperId,
  error,
  className,
  children,
}: FieldProps): ReactElement {
  const isGroup = role !== undefined;
  const caption = (
    <>
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </>
  );

  return (
    <div
      role={role}
      aria-labelledby={isGroup ? labelId : undefined}
      aria-required={isGroup ? required : undefined}
      aria-disabled={isGroup ? disabled : undefined}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {htmlFor === undefined ? (
        <span id={labelId} className={CAPTION}>
          {caption}
        </span>
      ) : (
        <label id={labelId} htmlFor={htmlFor} className={CAPTION}>
          {caption}
        </label>
      )}

      {children}

      {helper && !error ? (
        <span id={helperId} className="type-small text-ink-faint">
          {helper}
        </span>
      ) : null}

      {error ? (
        <span
          role="alert"
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="type-small font-medium text-destructive"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
