import type { Locale } from "@root/data";
import type { Dictionary } from "@root/i18n";

interface PluralForms {
  one: string;
  few: string;
  many: string;
}

const PLURAL_RULES: Record<Locale, Intl.PluralRules> = {
  uk: new Intl.PluralRules("uk"),
  en: new Intl.PluralRules("en"),
};

const formatCount = (
  count: number,
  locale: Locale,
  forms: PluralForms
): string => {
  const category = PLURAL_RULES[locale].select(count);
  const word =
    category === "one"
      ? forms.one
      : category === "few"
        ? forms.few
        : forms.many;

  return `${count} ${word}`;
};

export const formatItemCount = (
  count: number,
  locale: Locale,
  dictionary: Dictionary
): string =>
  formatCount(count, locale, {
    one: dictionary.category.itemOne,
    few: dictionary.category.itemFew,
    many: dictionary.category.itemMany,
  });

export const formatCategoryCount = (
  count: number,
  locale: Locale,
  dictionary: Dictionary
): string =>
  formatCount(count, locale, {
    one: dictionary.category.catOne,
    few: dictionary.category.catFew,
    many: dictionary.category.catMany,
  });
