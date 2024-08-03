export const currencyMap = {
  uk: "UAH",
  en: "USD",
};

export const formatPrice = (
  price: number,
  locale: keyof typeof currencyMap
) => {
  const currency = currencyMap[locale];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
};
