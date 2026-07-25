import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { IconButton } from "../icon-button/icon-button";
import { Price } from "../price/price";
import { QuantityStepper } from "../quantity-stepper/quantity-stepper";

interface CartLineProps {
  title: string;
  media: ReactNode;
  total: ReactNode;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  quantityLabel: string;
  removeLabel: string;
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
  className,
}: CartLineProps): ReactElement {
  return (
    <div
      className={cn(
        "grid grid-cols-[64px_1fr] gap-3 border-b border-line py-4",
        className
      )}
    >
      <div className="relative h-16 w-16 border border-ink [&_img]:object-cover">
        {media}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <span className="text-pretty font-body text-[0.9375rem] font-medium leading-[1.35]">
            {title}
          </span>

          <IconButton
            aria-label={removeLabel}
            onClick={onRemove}
            className="-mt-1 -mr-1.5 h-8 w-8 shrink-0"
          >
            <Icon name="trash-2" size={20} />
          </IconButton>
        </div>

        <div className="flex items-center justify-between gap-2">
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
