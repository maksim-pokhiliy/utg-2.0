"use client";

import type { ReactElement } from "react";

import { Container, Icon, Typography } from "@root/design-system";
import { useDictionary } from "@root/i18n";

import { NavLink } from "./NavLink";
import { INSTAGRAM_URL, NAV_ITEMS } from "./nav";

interface FooterProps {
  year: number;
}

export default function Footer({ year }: FooterProps): ReactElement {
  const dictionary = useDictionary();

  return (
    <footer className="bg-band text-band-foreground mt-auto">
      <Container className="flex flex-col gap-6 py-8">
        <Typography variant="body" className="max-w-xl text-band-foreground">
          {dictionary.footer.mission}
        </Typography>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="no-underline text-band-foreground hover:text-flag-yellow"
            >
              <Typography variant="caption" as="span">
                {dictionary.shared[item.label]}
              </Typography>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="no-underline text-band-foreground hover:text-flag-yellow"
          >
            <Icon name="instagram" />
          </a>

          <Typography variant="caption" as="span" className="text-band-muted">
            © {year} UTG
          </Typography>
        </div>
      </Container>
    </footer>
  );
}
