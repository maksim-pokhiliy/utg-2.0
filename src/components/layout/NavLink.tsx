"use client";

import Link from "next/link";
import type { ComponentProps, ReactElement } from "react";

import { useLocale } from "@root/i18n";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function NavLink({
  children,
  href,
  ...rest
}: NavLinkProps): ReactElement {
  const locale = useLocale();

  return (
    <Link href={`/${locale}${href}`} {...rest}>
      {children}
    </Link>
  );
}
