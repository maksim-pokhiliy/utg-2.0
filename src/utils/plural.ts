import type { Locale } from "@root/data";

interface PluralForms {
  one: string;
  few: string;
  many: string;
}

export const formatCount = (
  count: number,
  locale: Locale,
  forms: PluralForms
): string => {
  const category = new Intl.PluralRules(locale).select(count);
  const word =
    category === "one"
      ? forms.one
      : category === "few"
        ? forms.few
        : forms.many;

  return `${count} ${word}`;
};
