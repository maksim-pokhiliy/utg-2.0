export const currencyMap = {
  uk: "UAH",
  en: "USD",
};

export const formatPrice = (price: number, locale: "uk" | "en") => {
  const currency = currencyMap[locale];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
};
