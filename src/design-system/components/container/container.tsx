import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const container = cva("mx-auto w-full px-(--gutter)", {
  variants: {
    maxWidth: {
      default: "max-w-(--container)",
      full: "max-w-full",
    },
  },
  defaultVariants: { maxWidth: "default" },
});

export type ContainerMaxWidth = NonNullable<
  VariantProps<typeof container>["maxWidth"]
>;

type ContainerProps<T extends ElementType> = {
  as?: T;
  maxWidth?: ContainerMaxWidth;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Container<T extends ElementType = "div">({
  as,
  maxWidth,
  className,
  children,
  ...rest
}: ContainerProps<T>): ReactElement {
  const Component: ElementType = as ?? "div";

  return (
    <Component className={cn(container({ maxWidth }), className)} {...rest}>
      {children}
    </Component>
  );
}
