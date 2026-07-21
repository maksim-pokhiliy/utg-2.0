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
        title="UTG"
        size="full"
      >
        <div className="flex-1 flex flex-col px-(--gutter)">
          <nav className="mt-[10vh] flex flex-col gap-1">
            {NAV_ITEMS.map((item, index) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 no-underline text-band-foreground hover:text-flag-yellow"
              >
                <Typography
                  variant="caption"
                  as="span"
                  className="text-band-muted"
                >
                  {String(index + 1).padStart(2, "0")}
                </Typography>
                <Typography variant="nav" as="span">
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
            className="mt-auto mb-8 gap-2.5 self-start"
          >
            <Icon name="instagram" size={20} />
            <Typography variant="caption" as="span">
              Instagram
            </Typography>
          </IconLink>
        </div>
      </Dialog>
    </>
  );
}
