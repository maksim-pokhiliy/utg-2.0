"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import {
  Icon,
  IconButton,
  Price,
  QuantityStepper,
  Typography,
} from "@root/design-system";
import { formatPrice } from "@root/utils/formatPrice";
import { useCartStore, type ICartItem } from "@root/store/cart";
import { useDictionary, useLocale, useMoney } from "@root/i18n";

interface CartLineProps {
  item: ICartItem;
}

export default function CartLine({ item }: CartLineProps): ReactElement {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 py-4 border-b border-line">
      <div className="relative w-16 h-16 border border-ink">
        <Image
          src={item.image}
          alt={item.title}
          fill
          quality={75}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Typography variant="small" as="span" className="text-ink">
            {item.title}
          </Typography>

          <IconButton
            aria-label="Remove"
            onClick={() => removeItem(item.id)}
            className="w-8 h-8 shrink-0"
          >
            <Icon name="trash-2" size={20} />
          </IconButton>
        </div>

        <Price>{formatPrice(item.price * item.quantity, money, locale)}</Price>

        <QuantityStepper
          size="sm"
          value={item.quantity}
          onChange={(quantity) => setQuantity(item.id, quantity)}
          ariaLabel={dictionary.shared.quantity}
        />
      </div>
    </div>
  );
}
