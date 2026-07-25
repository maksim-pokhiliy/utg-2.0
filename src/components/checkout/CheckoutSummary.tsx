"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import { Price, Typography } from "@root/design-system";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import type { ICartItem } from "@root/store/cart";
import { formatPrice } from "@root/utils/formatPrice";

interface CheckoutSummaryProps {
  items: ICartItem[];
  itemCount: number;
  total: number;
}

export function CheckoutSummary({
  items,
  itemCount,
  total,
}: CheckoutSummaryProps): ReactElement {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  return (
    <div className="border-2 border-ink bg-paper">
      <div className="bg-band text-band-foreground flex items-center justify-between gap-3 px-4 py-2.5">
        <Typography variant="caption" as="span">
          {dictionary.checkout.summary}
        </Typography>

        <Typography variant="caption" as="span" className="text-band-muted">
          {`[${itemCount}]`}
        </Typography>
      </div>

      <div className="px-4 pt-1 pb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b border-line py-2.5"
          >
            <div className="relative h-12 w-12 shrink-0 border border-ink">
              <Image
                src={item.image}
                alt=""
                fill
                quality={75}
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Typography variant="small" as="span" className="text-pretty">
                {item.title}
              </Typography>

              <Typography
                variant="caption"
                as="span"
                className="text-ink-faint"
              >
                {`×${item.quantity}`}
              </Typography>
            </div>

            <Price>
              {formatPrice(item.price * item.quantity, money, locale)}
            </Price>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-3 pt-3.5">
          <Typography variant="caption" as="span">
            {dictionary.cart.total}
          </Typography>

          <Price size="big">{formatPrice(total, money, locale)}</Price>
        </div>
      </div>
    </div>
  );
}
