import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { DEFAULT_LOCALE, LOCALES } from "@root/utils/locale";

const PUBLIC_FILE = /\.[^/]+$/;

function getLocale(request: Request): string {
  const headers = {
    "accept-language": request.headers.get("accept-language") || DEFAULT_LOCALE,
  };

  const languages = new Negotiator({ headers }).languages();

  return match(languages, LOCALES, DEFAULT_LOCALE);
}

export function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
