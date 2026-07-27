"use client";

import Image from "next/image";
import { useEffect, useState, type ReactElement } from "react";

import { usePathname } from "next/navigation";

import {
  Button,
  CartLine,
  ConfirmDialog,
  Icon,
  IconButton,
  Price,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  Typography,
} from "@root/design-system";
import { formatPrice } from "@root/utils/formatPrice";
import {
  useCartStore,
  selectItemCount,
  selectSubtotal,
  type ICartItem,
} from "@root/store/cart";
import { useSidebarStore } from "@root/store/sidebar";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { NavLink } from "@root/components/layout/NavLink";

export default function CartDrawer(): ReactElement {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  const cart = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const total = useCartStore(selectSubtotal);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const pathname = usePathname();

  const [removeTarget, setRemoveTarget] = useState<ICartItem | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) {
      setIsRemoveOpen(false);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  const handleRemoveRequest = (item: ICartItem) => {
    setRemoveTarget(item);
    setIsRemoveOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (removeTarget) {
      removeItem(removeTarget.id);
    }

    setIsRemoveOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <div className="bg-band text-band-foreground flex items-center justify-between gap-3 py-2.5 pl-4 pr-3">
          <div className="flex items-center gap-3">
            <SheetTitle asChild>
              <Typography variant="h3" as="h2">
                {dictionary.cart.cart}
              </Typography>
            </SheetTitle>

            {itemCount > 0 ? (
              <Typography
                variant="caption"
                as="span"
                className="text-band-muted"
              >
                {`[${itemCount}]`}
              </Typography>
            ) : null}
          </div>

          <SheetClose asChild>
            <IconButton variant="band" aria-label={dictionary.shared.close}>
              <Icon name="x" />
            </IconButton>
          </SheetClose>
        </div>

        {cart.length ? (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {cart.map((item) => (
                <CartLine
                  key={item.id}
                  title={item.title}
                  media={
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      quality={75}
                      sizes="64px"
                    />
                  }
                  total={formatPrice(item.price * item.quantity, money, locale)}
                  quantity={item.quantity}
                  onQuantityChange={(quantity) =>
                    setQuantity(item.id, quantity)
                  }
                  onRemove={() => handleRemoveRequest(item)}
                  quantityLabel={`${dictionary.shared.quantity}: ${item.title}`}
                  removeLabel={`${dictionary.cart.remove_confirm}: ${item.title}`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3.5 border-t-2 border-ink px-5 pt-4 pb-5">
              <div className="flex items-baseline justify-between">
                <Typography variant="caption" as="span">
                  {dictionary.cart.total}
                </Typography>

                <Price size="big">{formatPrice(total, money, locale)}</Price>
              </div>

              <Button asChild variant="accent" block>
                <NavLink href="/checkout" onClick={close}>
                  {dictionary.cart.proceed}
                </NavLink>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Icon name="shopping-bag" size={40} />

            <Typography variant="h3" as="p">
              {dictionary.cart.empty_cart}
            </Typography>

            <Typography variant="small" as="p" className="text-ink-faint">
              {dictionary.cart.add_to_cart}{" "}
              <NavLink
                href="/category"
                onClick={close}
                className="text-flag-blue"
              >
                {dictionary.cart.here}
              </NavLink>
            </Typography>
          </div>
        )}

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
      </SheetContent>
    </Sheet>
  );
}
