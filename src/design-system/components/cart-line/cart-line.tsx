import { cva, type VariantProps } from "class-variance-authority";
import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Icon, type IconSize } from "../icon/icon";
import { IconButton } from "../icon-button/icon-button";
import { Price } from "../price/price";
import { QuantityStepper } from "../quantity-stepper/quantity-stepper";

const cartLine = cva("grid gap-3 border-b border-line", {
  variants: {
    scale: {
      drawer: "grid-cols-[64px_1fr] py-4",
      summary: "grid-cols-[56px_1fr] py-2.5",
    },
  },
});

const cartLineMedia = cva("relative border border-ink [&_img]:object-cover", {
  variants: {
    scale: {
      drawer: "w-16 min-h-16",
      summary: "w-14 min-h-14",
    },
  },
});

const cartLineContent = cva("flex min-w-0 flex-col justify-between", {
  variants: {
    scale: {
      drawer: "min-h-16 gap-2",
      summary: "min-h-14 gap-1.5",
    },
  },
});

const cartLineTitleRow = cva("flex items-start justify-between", {
  variants: {
    scale: {
      drawer: "gap-3",
      summary: "gap-2",
    },
  },
});

const cartLineTitle = cva("text-pretty", {
  variants: {
    scale: {
      drawer: "font-body text-[0.9375rem] font-medium leading-[1.35]",
      summary: "type-small",
    },
  },
});

const cartLineRemove = cva("shrink-0", {
  variants: {
    scale: {
      drawer: "-mt-1 -mr-1.5 h-8 w-8",
      summary: "-mt-0.5 -mr-1 h-7 w-7",
    },
  },
});

export type CartLineScale = NonNullable<VariantProps<typeof cartLine>["scale"]>;

const REMOVE_ICON_SIZE = {
  drawer: 20,
  summary: 16,
} satisfies Record<CartLineScale, IconSize>;

interface CartLineProps {
  title: string;
  media: ReactNode;
  total: ReactNode;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  quantityLabel: string;
  removeLabel: string;
  scale?: CartLineScale;
  className?: string;
}

export function CartLine({
  title,
  media,
  total,
  quantity,
  onQuantityChange,
  onRemove,
  quantityLabel,
  removeLabel,
  scale = "drawer",
  className,
}: CartLineProps): ReactElement {
  return (
    <div className={cn(cartLine({ scale }), className)}>
      <div className={cartLineMedia({ scale })}>{media}</div>

      <div className={cartLineContent({ scale })}>
        <div className={cartLineTitleRow({ scale })}>
          <span className={cartLineTitle({ scale })}>{title}</span>

          <IconButton
            aria-label={removeLabel}
            onClick={onRemove}
            className={cartLineRemove({ scale })}
          >
            <Icon name="trash-2" size={REMOVE_ICON_SIZE[scale]} />
          </IconButton>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <QuantityStepper
            size="sm"
            value={quantity}
            onChange={onQuantityChange}
            ariaLabel={quantityLabel}
          />

          <Price>{total}</Price>
        </div>
      </div>
    </div>
  );
}
