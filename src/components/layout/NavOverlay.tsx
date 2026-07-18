"use client";

import { useState, type ReactElement } from "react";

import {
  Dialog,
  Icon,
  IconButton,
  IconLink,
  Typography,
} from "@root/design-system";
import { useDictionary } from "@root/i18n";

import { NavLink } from "./NavLink";
import { INSTAGRAM_URL, NAV_ITEMS } from "./nav";

export function NavOverlay(): ReactElement {
  const dictionary = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label="Menu" onClick={() => setOpen(true)}>
        <Icon name="menu" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Menu"
        size="full"
      >
        <nav className="flex-1 flex flex-col items-center justify-center gap-6">
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="no-underline text-band-foreground hover:text-flag-yellow flex items-baseline gap-4"
            >
              <Typography
                variant="caption"
                as="span"
                className="text-band-muted"
              >
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography variant="h2" as="span">
                {dictionary.shared[item.label]}
              </Typography>
            </NavLink>
          ))}

          <IconLink
            href={INSTAGRAM_URL}
            external
            variant="band"
            aria-label="Instagram"
            className="mt-8"
          >
            <Icon name="instagram" size={24} />
          </IconLink>
        </nav>
      </Dialog>
    </>
  );
}
