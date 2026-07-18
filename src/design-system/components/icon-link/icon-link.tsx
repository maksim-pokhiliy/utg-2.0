import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ReactElement } from "react";

import { cn } from "../../lib/cn";

const iconLink = cva(
  "inline-flex items-center justify-center no-underline transition-colors duration-[120ms] ease-[var(--ease)]",
  {
    variants: {
      variant: {
        default: "text-ink-soft hover:text-ink",
        band: "text-band-foreground hover:text-flag-yellow",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type IconLinkVariant = NonNullable<
  VariantProps<typeof iconLink>["variant"]
>;

interface IconLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: IconLinkVariant;
  external?: boolean;
  "aria-label": string;
}

export function IconLink({
  variant,
  external = false,
  className,
  children,
  ...rest
}: IconLinkProps): ReactElement {
  const externalProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <a
      className={cn(iconLink({ variant }), className)}
      {...rest}
      {...externalProps}
    >
      {children}
    </a>
  );
}
