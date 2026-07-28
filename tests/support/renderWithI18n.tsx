import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";

import ukDictionary from "@root/app/[lang]/dictionaries/uk.json";
import type { Locale } from "@root/data";
import { Toaster } from "@root/design-system";
import { I18nProvider, type Dictionary } from "@root/i18n";
import type { IMoney } from "@root/utils/formatPrice";

export const UK_DICTIONARY: Dictionary = ukDictionary;

export const UAH_MONEY: IMoney = { coefficient: 1, currency: "UAH" };

export const USD_MONEY: IMoney = { coefficient: 0.024, currency: "USD" };

interface RenderWithI18nOptions {
  locale?: Locale;
  dictionary?: Dictionary;
  money?: IMoney;
}

export const renderWithI18n = (
  ui: ReactElement,
  options: RenderWithI18nOptions = {}
): RenderResult => {
  const {
    locale = "uk",
    dictionary = UK_DICTIONARY,
    money = UAH_MONEY,
  } = options;

  return render(
    <I18nProvider locale={locale} dictionary={dictionary} money={money}>
      {ui}
      <Toaster />
    </I18nProvider>
  );
};
