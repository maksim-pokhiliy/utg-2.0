"use client";

import type { ReactElement } from "react";

import {
  Badge,
  Button,
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
import { useCartStore, selectItemCount, selectSubtotal } from "@root/store/cart";
import { useSidebarStore } from "@root/store/sidebar";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { NavLink } from "@root/components/layout/NavLink";

import CartLine from "./CartLine";

export default function CartDrawer(): ReactElement {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);

  const cart = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const total = useCartStore(selectSubtotal);

  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
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

            {itemCount > 0 ? <Badge variant="band">{itemCount}</Badge> : null}
          </div>

          <SheetClose asChild>
            <IconButton variant="band" aria-label="Close">
              <Icon name="x" />
            </IconButton>
          </SheetClose>
        </div>

        {cart.length ? (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {cart.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t-2 border-ink p-4">
              <div className="flex items-center justify-between">
                <Typography variant="caption" as="span">
                  {dictionary.cart.total}
                </Typography>

                <Price size="big">
                  {formatPrice(total, money, locale)}
                </Price>
              </div>

              <Button asChild variant="accent" block>
                <NavLink href="/checkout" onClick={close}>
                  {dictionary.cart.proceed}
                </NavLink>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
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
      </SheetContent>
    </Sheet>
  );
}
