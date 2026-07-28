import type { Locale } from "@root/data";

export const DEFAULT_LOCALE: Locale = "uk";

export const LOCALES: readonly Locale[] = ["uk", "en"];

export const resolveLocale = (lang: string): Locale =>
  lang === "en" ? "en" : DEFAULT_LOCALE;
