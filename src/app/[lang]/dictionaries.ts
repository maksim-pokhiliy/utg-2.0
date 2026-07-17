import "server-only";

import type { Locale } from "@root/data";
import type { Dictionary } from "@root/i18n/dictionary";

import en from "./dictionaries/en.json";
import uk from "./dictionaries/uk.json";

const dictionaries = { uk, en } satisfies Record<Locale, Dictionary>;

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale];
