import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["uk", "en"];

const PUBLIC_FILE = /\.[^/]+$/;

function getLocale(request: Request): string {
  const headers = {
    "accept-language": request.headers.get("accept-language") || "uk",
  };

  const languages = new Negotiator({ headers }).languages();
  const defaultLocale = "uk";

  return match(languages, locales, defaultLocale);
}

export function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
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
