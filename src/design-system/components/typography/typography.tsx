import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";

import { cn } from "../../lib/cn";

export type TypographyVariant =
  | "hero"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "small"
  | "caption"
  | "price";

const VARIANT_CLASS: Record<TypographyVariant, string> = {
  hero: "type-hero",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  body: "type-body",
  small: "type-small",
  caption: "type-caption",
  price: "type-price",
};

const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  hero: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  small: "p",
  caption: "span",
  price: "span",
};

type TypographyProps<T extends ElementType> = {
  variant?: TypographyVariant;
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Typography<T extends ElementType = "p">({
  variant = "body",
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>): ReactElement {
  const Component: ElementType = as ?? DEFAULT_TAG[variant];

  return (
    <Component className={cn(VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
