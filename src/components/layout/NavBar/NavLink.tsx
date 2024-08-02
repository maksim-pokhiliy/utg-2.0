"use client";

import Link, { LinkProps } from "next/link";
import { useRecoilValue } from "recoil";

import { languageState } from "@root/recoil/atoms";

export type NavLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export function NavLink(props: NavLinkProps) {
  const { children, href, ...linkProps } = props;

  const locale = useRecoilValue(languageState);

  const localizedHref = `/${locale}${href}`;

  return (
    <Link href={localizedHref} {...linkProps}>
      {props.children}
    </Link>
  );
}
