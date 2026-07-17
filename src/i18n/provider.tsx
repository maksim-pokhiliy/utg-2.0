"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "@root/data";
import type { IMoney } from "@root/utils/formatPrice";

import type { Dictionary } from "./dictionary";

interface I18nValue {
  locale: Locale;
  dictionary: Dictionary;
  money: IMoney;
}

const I18nContext = createContext<I18nValue | null>(null);

interface I18nProviderProps extends I18nValue {
  children: ReactNode;
}

export function I18nProvider({
  locale,
  dictionary,
  money,
  children,
}: I18nProviderProps) {
  const value = useMemo(
    () => ({ locale, dictionary, money }),
    [locale, dictionary, money]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nValue {
  const context = useContext(I18nContext);

  if (context === null) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}

export const useLocale = (): Locale => useI18n().locale;

export const useDictionary = (): Dictionary => useI18n().dictionary;

export const useMoney = (): IMoney => useI18n().money;
