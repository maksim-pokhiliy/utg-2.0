"use client";

import Link, { LinkProps } from "next/link";

import { useLocale } from "@root/i18n";

export type NavLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export function NavLink(props: NavLinkProps) {
  const { children, href, ...linkProps } = props;

  const locale = useLocale();

  const localizedHref = `/${locale}${href}`;

  return (
    <Link href={localizedHref} {...linkProps}>
      {children}
    </Link>
  );
}
