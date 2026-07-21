import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";
import { Typography } from "../typography/typography";

const iconLink = cva(
  "inline-flex items-center justify-center no-underline transition-colors duration-[120ms] ease-[var(--ease)]",
  {
    variants: {
      variant: {
        default: "text-ink-soft hover:text-ink",
        band: "text-band-foreground hover:text-flag-yellow",
      },
      labeled: {
        true: "gap-2 min-h-12",
        false: "",
      },
    },
    defaultVariants: { variant: "default", labeled: false },
  }
);

export type IconLinkVariant = NonNullable<
  VariantProps<typeof iconLink>["variant"]
>;

interface IconLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: IconLinkVariant;
  label?: string;
  external?: boolean;
  "aria-label": string;
}

export function IconLink({
  variant,
  label,
  external = false,
  className,
  children,
  ...rest
}: IconLinkProps): ReactElement {
  const externalProps = external ? { target: "_blank", rel: "noreferrer" } : {};
  const hasLabel = label !== undefined;

  return (
    <a
      className={cn(iconLink({ variant, labeled: hasLabel }), className)}
      {...rest}
      {...externalProps}
    >
      {children}
      {hasLabel ? (
        <Typography variant="caption" as="span">
          {label}
        </Typography>
      ) : null}
    </a>
  );
}
