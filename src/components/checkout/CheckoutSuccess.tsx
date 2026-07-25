"use client";

import type { ReactElement } from "react";

import { Container, Icon, Typography } from "@root/design-system";
import { useDictionary } from "@root/i18n";

export function CheckoutSuccess(): ReactElement {
  const dictionary = useDictionary();

  return (
    <Container className="pt-12 pb-24">
      <div role="status" className="flex flex-col gap-6">
        <div className="bg-flag-yellow text-ink flex h-12 w-12 items-center justify-center">
          <Icon name="check" size={24} />
        </div>

        <Typography variant="body" as="p" className="max-w-[55ch] text-pretty">
          {dictionary.cart.order_success}
        </Typography>

        <Typography
          variant="small"
          as="p"
          className="max-w-[55ch] text-pretty text-ink-faint"
        >
          {dictionary.checkout.successNote}
        </Typography>
      </div>
    </Container>
  );
}
