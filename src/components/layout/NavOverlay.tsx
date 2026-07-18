"use client";

import { useState, type ReactElement } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Icon,
  IconButton,
  Typography,
} from "@root/design-system";
import { useDictionary, type Dictionary } from "@root/i18n";

import { NavLink } from "./NavLink";

const NAV_ITEMS: { href: string; label: keyof Dictionary["shared"] }[] = [
  { href: "/", label: "home" },
  { href: "/category", label: "merch" },
  { href: "/reports", label: "reports" },
  { href: "/about", label: "about" },
];

const INSTAGRAM_URL = "https://www.instagram.com/ukrainian_tactical_gear/";

export function NavOverlay(): ReactElement {
  const dictionary = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconButton aria-label="Menu">
          <Icon name="menu" />
        </IconButton>
      </DialogTrigger>

      <DialogContent
        size="full"
        className="bg-ink text-band-foreground flex flex-col"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>

        <div className="flex justify-end p-(--gutter)">
          <DialogClose asChild>
            <IconButton variant="band" aria-label="Close">
              <Icon name="x" />
            </IconButton>
          </DialogClose>
        </div>

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

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="no-underline text-band-foreground hover:text-flag-yellow mt-8"
          >
            <Icon name="instagram" size={24} />
          </a>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
