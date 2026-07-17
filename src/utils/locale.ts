import type { Locale } from "@root/data";

export const resolveLocale = (lang: string): Locale =>
  lang === "en" ? "en" : "uk";
