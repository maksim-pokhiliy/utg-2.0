"use client";

import { useState, type ReactElement } from "react";

import { Container, SectionBand, Typography } from "@root/design-system";
import { useDictionary, useLocale } from "@root/i18n";
import {
  selectItemCount,
  selectSubtotal,
  useCartHydrated,
  useCartStore,
} from "@root/store/cart";
import { formatItemCount } from "@root/utils/plural";

import { CheckoutForm } from "@root/components/checkout/CheckoutForm";
import { CheckoutSummary } from "@root/components/checkout/CheckoutSummary";
import { CheckoutSuccess } from "@root/components/checkout/CheckoutSuccess";
import { NavLink } from "@root/components/layout/NavLink";

export default function CheckoutScreen(): ReactElement {
  const cart = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const total = useCartStore(selectSubtotal);
  const clear = useCartStore((state) => state.clear);
  const isHydrated = useCartHydrated();

  const dictionary = useDictionary();
  const locale = useLocale();

  const [isSuccess, setIsSuccess] = useState(false);

  const isFormVisible = isHydrated && !isSuccess && cart.length > 0;
  const isEmptyVisible = isHydrated && !isSuccess && cart.length === 0;

  const handlePlaced = () => {
    setIsSuccess(true);
    window.scrollTo(0, 0);
    clear();
  };

  return (
    <>
      <SectionBand
        title={
          isSuccess
            ? dictionary.checkout.successTitle
            : dictionary.checkout.checkout
        }
        meta={
          isFormVisible
            ? formatItemCount(itemCount, locale, dictionary)
            : undefined
        }
      />

      {isSuccess ? (
        <CheckoutSuccess />
      ) : isFormVisible ? (
        <Container className="pt-8 pb-24">
          <div className="flex flex-row-reverse flex-wrap items-start gap-x-12 gap-y-8">
            <aside className="min-w-0 flex-[1_1_320px]">
              <CheckoutSummary
                items={cart}
                itemCount={itemCount}
                total={total}
              />
            </aside>

            <CheckoutForm onPlaced={handlePlaced} />
          </div>
        </Container>
      ) : isEmptyVisible ? (
        <Container className="flex flex-col items-center gap-2 pt-16 pb-24 text-center">
          <Typography variant="h3" as="p">
            {dictionary.cart.empty_cart}
          </Typography>

          <Typography variant="small" as="p" className="text-ink-faint">
            {dictionary.cart.add_to_cart}{" "}
            <NavLink href="/category" className="text-flag-blue">
              {dictionary.cart.here}
            </NavLink>
          </Typography>
        </Container>
      ) : null}
    </>
  );
}
