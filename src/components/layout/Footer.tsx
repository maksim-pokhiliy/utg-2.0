"use client";

import type { ReactElement } from "react";

import { Container, Icon, IconLink, Typography } from "@root/design-system";
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
      <Container className="flex flex-col gap-7 pt-12 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-6">
          <Typography variant="small" className="max-w-[38ch] text-band-muted">
            {dictionary.footer.mission}
          </Typography>

          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="no-underline text-band-foreground hover:text-flag-yellow"
              >
                <Typography
                  variant="small"
                  as="span"
                  className="font-display font-medium leading-none uppercase tracking-[0.05em]"
                >
                  {dictionary.shared[item.label]}
                </Typography>
              </NavLink>
            ))}
          </nav>

          <IconLink
            href={INSTAGRAM_URL}
            external
            variant="band"
            aria-label="Instagram"
          >
            <Icon name="instagram" />
          </IconLink>
        </div>

        <div className="flex items-center justify-between border-t border-band-line pt-4">
          <Typography variant="caption" as="span" className="text-band-muted">
            © {year} UTG
          </Typography>

          <Typography variant="caption" as="span" className="text-band-muted">
            ua-tactical-gear.com
          </Typography>
        </div>
      </Container>
    </footer>
  );
}
