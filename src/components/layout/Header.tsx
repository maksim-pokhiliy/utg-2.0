"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import { Container, Icon, IconButton, Typography } from "@root/design-system";
import { useCartStore, selectItemCount } from "@root/store/cart";
import { useSidebarStore } from "@root/store/sidebar";

import LanguageSwitcher from "./LanguageSwitcher";
import { NavLink } from "./NavLink";
import { NavOverlay } from "./NavOverlay";

export default function Header(): ReactElement {
  const itemsCount = useCartStore(selectItemCount);
  const openCart = useSidebarStore((state) => state.open);

  return (
    <header className="sticky top-0 z-40 bg-background border-b-2 border-ink">
      <Container maxWidth="full" className="flex items-center gap-3 h-16">
        <NavLink
          href="/"
          className="no-underline flex items-center gap-2 mr-auto"
        >
          <Image
            src="/logo.png"
            alt="UTG"
            width={44}
            height={31}
            className="h-8 w-auto"
            priority
          />
          <Typography variant="h3" as="span" className="text-ink">
            UTG
          </Typography>
        </NavLink>

        <LanguageSwitcher />

        <IconButton
          aria-label={`Cart: ${itemsCount}`}
          onClick={openCart}
          className="relative"
        >
          <Icon name="shopping-bag" />
          {itemsCount > 0 ? (
            <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 flex items-center justify-center bg-accent text-accent-foreground">
              <Typography variant="caption" as="span">
                {itemsCount}
              </Typography>
            </span>
          ) : null}
        </IconButton>

        <NavOverlay />
      </Container>
    </header>
  );
}
