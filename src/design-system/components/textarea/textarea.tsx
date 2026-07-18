import { cva, type VariantProps } from "class-variance-authority";
import type { ReactElement, TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

const textarea = cva(
  "w-full min-h-24 px-3 py-2.5 bg-white text-ink type-body resize-y placeholder:text-ink-faint border-2 disabled:bg-muted disabled:border-ink-faint disabled:text-ink-faint disabled:cursor-not-allowed",
  {
    variants: {
      invalid: {
        true: "border-destructive focus-visible:outline-destructive",
        false: "border-input",
      },
    },
    defaultVariants: { invalid: false },
  }
);

export type TextareaInvalid = NonNullable<
  VariantProps<typeof textarea>["invalid"]
>;

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({
  invalid,
  className,
  ...rest
}: TextareaProps): ReactElement {
  return (
    <textarea className={cn(textarea({ invalid }), className)} {...rest} />
  );
}
