import type { Locale } from "@root/data";
import { stripInvisibles } from "@root/utils/invisibles";

const SEPARATORS = /[\s()\-‐-―]/g;

const UK_NATIONAL = /^0(\d{9})$/;

const UK_TRUNK = /^380(\d{9})$/;

const UK_INTERNATIONAL = /^\+380(\d{9})$/;

const EN_INTERNATIONAL = /^\+(\d{8,15})$/;

const UK_PREFIX = "+380";

const stripSeparators = (raw: string): string =>
  stripInvisibles(raw).replace(SEPARATORS, "");

const normalizeUkrainian = (compact: string): string | null => {
  const match =
    UK_NATIONAL.exec(compact) ??
    UK_TRUNK.exec(compact) ??
    UK_INTERNATIONAL.exec(compact);

  return match === null ? null : `${UK_PREFIX}${match[1]}`;
};

const normalizeInternational = (compact: string): string | null => {
  const match = EN_INTERNATIONAL.exec(compact);

  return match === null ? null : `+${match[1]}`;
};

export const normalizePhone = (raw: string, locale: Locale): string | null => {
  const compact = stripSeparators(raw);

  return locale === "uk"
    ? normalizeUkrainian(compact)
    : normalizeInternational(compact);
};
