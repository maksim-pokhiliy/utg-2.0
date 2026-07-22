import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Price } from "../price/price";

interface ProductCardProps {
  title: string;
  price: ReactNode;
  isAvailable: boolean;
  orderLabel: string;
  outLabel: string;
  media: ReactNode;
  className?: string;
}

export function ProductCard({
  title,
  price,
  isAvailable,
  orderLabel,
  outLabel,
  media,
  className,
}: ProductCardProps): ReactElement {
  return (
    <span
      className={cn(
        "group/card flex flex-col border-2 border-ink bg-paper",
        className
      )}
    >
      <span
        className={cn(
          "relative aspect-square overflow-hidden border-b-2 border-ink bg-white [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-[var(--ease)] group-hover/card:[&_img]:scale-[1.03]",
          !isAvailable && "[&_img]:grayscale-[0.45] [&_img]:opacity-70"
        )}
      >
        {media}
        {!isAvailable ? (
          <Badge variant="out" className="absolute left-0 top-0">
            {outLabel}
          </Badge>
        ) : null}
      </span>

      <span className="flex grow flex-col gap-1 px-[14px] pt-3 pb-[14px]">
        <span
          className={cn(
            "text-pretty font-body text-[1rem] font-medium leading-[1.35]",
            !isAvailable && "text-ink-muted"
          )}
        >
          {title}
        </span>

        <span className="mt-auto flex items-center justify-between gap-3 pt-[10px]">
          <Price muted={!isAvailable}>{price}</Price>
          {isAvailable ? (
            <Button
              asChild
              size="sm"
              className="group-hover/card:bg-paper group-hover/card:text-ink"
            >
              <span>{orderLabel}</span>
            </Button>
          ) : null}
        </span>
      </span>
    </span>
  );
}
