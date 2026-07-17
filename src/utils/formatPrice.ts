export const currencyMap = {
  uk: "UAH",
  en: "USD",
} as const;

export type Currency = "UAH" | "USD";

export interface IMoney {
  coefficient: number;
  currency: Currency;
}

export const resolveMoney = (
  locale: keyof typeof currencyMap,
  rates: Record<string, number>
): IMoney => {
  const target = currencyMap[locale];
  const rate = rates[target];

  return Number.isFinite(rate) && rate > 0
    ? { coefficient: rate, currency: target }
    : { coefficient: 1, currency: "UAH" };
};

export const formatPrice = (uahPrice: number, money: IMoney, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: "narrowSymbol",
  }).format(uahPrice * money.coefficient);
