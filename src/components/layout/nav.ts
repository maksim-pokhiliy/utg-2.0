import type { Dictionary } from "@root/i18n";

export const NAV_ITEMS: { href: string; label: keyof Dictionary["shared"] }[] =
  [
    { href: "/", label: "home" },
    { href: "/category", label: "merch" },
    { href: "/reports", label: "reports" },
    { href: "/about", label: "about" },
  ];

export const INSTAGRAM_URL =
  "https://www.instagram.com/ukrainian_tactical_gear/";
