"use client";

import Image from "next/image";
import { useState, type ReactElement } from "react";

import {
  CartLine,
  ConfirmDialog,
  Price,
  Typography,
} from "@root/design-system";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import {
  MAX_CART_QUANTITY,
  selectItemCount,
  selectSubtotal,
  useCartStore,
  type ICartItem,
} from "@root/store/cart";
import { cartQuantityLabel, cartRemoveLabel } from "@root/utils/cartLabels";
import { formatPrice } from "@root/utils/formatPrice";

const MEDIA_SIZES = "96px";

const MEDIA_QUALITY = 75;

interface CheckoutSummaryProps {
  isPending: boolean;
}

export function CheckoutSummary({
  isPending,
}: CheckoutSummaryProps): ReactElement {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const total = useCartStore(selectSubtotal);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const [removeTarget, setRemoveTarget] = useState<ICartItem | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const handleRemoveRequest = (item: ICartItem) => {
    setRemoveTarget(item);
    setIsRemoveOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (isPending) {
      return;
    }

    if (removeTarget) {
      removeItem(removeTarget.id);
    }

    setIsRemoveOpen(false);
  };

  return (
    <div
      data-testid="checkout-summary"
      className="border-2 border-ink bg-paper"
    >
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
          <CartLine
            key={item.id}
            scale="summary"
            locked={isPending}
            title={item.title}
            media={
              <Image
                src={item.image}
                alt=""
                fill
                quality={MEDIA_QUALITY}
                sizes={MEDIA_SIZES}
              />
            }
            total={formatPrice(item.price * item.quantity, money, locale)}
            quantity={item.quantity}
            max={MAX_CART_QUANTITY}
            onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
            onRemove={() => handleRemoveRequest(item)}
            quantityLabel={cartQuantityLabel(dictionary, item.title)}
            removeLabel={cartRemoveLabel(dictionary, item.title)}
          />
        ))}

        <div className="flex items-baseline justify-between gap-3 pt-3.5">
          <Typography variant="caption" as="span">
            {dictionary.cart.total}
          </Typography>

          <Price size="big">{formatPrice(total, money, locale)}</Price>
        </div>
      </div>

      <ConfirmDialog
        open={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemoveConfirm}
        title={dictionary.cart.remove_title}
        body={dictionary.cart.remove_body.replace(
          "{title}",
          () => removeTarget?.title ?? ""
        )}
        cancelLabel={dictionary.cart.remove_cancel}
        confirmLabel={dictionary.cart.remove_confirm}
        destructive
      />
    </div>
  );
}
