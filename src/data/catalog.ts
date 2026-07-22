import {
  CatalogCategory,
  CatalogProduct,
  CategorySlug,
  CategorySummary,
  CategoryView,
  Locale,
  LocalizedText,
  ProductView,
} from "./catalog.types";

const TSHIRT_SIZES = ["M", "L", "XL", "2XL"];

const DEATH_DESCRIPTION: LocalizedText = {
  en: 'Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "With you or for you it depends on how you trained" slogan and large graphic.',
  uk: 'Ліворуч спереду дрібний принт: лого Ukrainian Tactical Gear. Принт на спині зі слоганом "With you or for you it depends on how you trained" і великим малюнком.',
};

const WELCOME_DESCRIPTION: LocalizedText = {
  en: 'Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "Welcome to Ukraine, suka!" slogan and large graphic.',
  uk: 'Ліворуч спереду дрібний принт: лого Ukrainian Tactical Gear. Принт на спині зі слоганом "Welcome to Ukraine, suka!" і великим малюнком.',
};

const categories: CatalogCategory[] = [
  {
    slug: "patches",
    name: { uk: "Патчі", en: "Patches" },
    image: "/images/products/patches_utg.jpg",
  },
  {
    slug: "stickers",
    name: { uk: "Стікери", en: "Stickers" },
    image: "/images/products/stickers2.JPG",
  },
  {
    slug: "tshirts",
    name: { uk: "Футболки", en: "T-Shirts" },
    image: "/images/products/BLACK.jpg",
  },
];

const products: CatalogProduct[] = [
  {
    slug: "death-black",
    category: "tshirts",
    title: { uk: "«Death» Чорна", en: "«Death» Black" },
    description: DEATH_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/BLACK.jpg",
  },
  {
    slug: "welcome-black",
    category: "tshirts",
    title: { uk: "«Welcome» Чорна", en: "«Welcome» Black" },
    description: WELCOME_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/BLACK1.jpg",
  },
  {
    slug: "death-green",
    category: "tshirts",
    title: { uk: "«Death» Зелена", en: "«Death» Green" },
    description: DEATH_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/GREEN.jpg",
  },
  {
    slug: "welcome-green",
    category: "tshirts",
    title: { uk: "«Welcome» Зелена", en: "«Welcome» Green" },
    description: WELCOME_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/GREEN1.jpg",
  },
  {
    slug: "death-grey",
    category: "tshirts",
    title: { uk: "«Death» Сіра", en: "«Death» Grey" },
    description: DEATH_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/GREY.jpg",
  },
  {
    slug: "welcome-grey",
    category: "tshirts",
    title: { uk: "«Welcome» Сіра", en: "«Welcome» Grey" },
    description: WELCOME_DESCRIPTION,
    price: 1000,
    isAvailable: false,
    sizes: TSHIRT_SIZES,
    image: "/images/products/GREY1.jpg",
  },
  {
    slug: "waiting",
    category: "patches",
    title: { uk: "«Waiting»", en: "«Waiting»" },
    price: 300,
    isAvailable: true,
    image: "/images/products/patches_waiting.jpg",
  },
  {
    slug: "welcome",
    category: "patches",
    title: { uk: "«Welcome»", en: "«Welcome»" },
    price: 300,
    isAvailable: true,
    image: "/images/products/patches_welcome.jpg",
  },
  {
    slug: "death",
    category: "patches",
    title: { uk: "«Death»", en: "«Death»" },
    price: 300,
    isAvailable: true,
    image: "/images/products/patches_with_you.jpg",
  },
  {
    slug: "utg",
    category: "patches",
    title: { uk: "«UTG»", en: "«UTG»" },
    price: 300,
    isAvailable: true,
    image: "/images/products/patches_utg.jpg",
  },
  {
    slug: "set",
    category: "patches",
    title: {
      uk: "Набір із «Waiting, Welcome, Death»",
      en: "Set of «Waiting, Welcome, Death»",
    },
    price: 800,
    isAvailable: true,
    image: "/images/products/patches_set.jpg",
  },
  {
    slug: "sticker-pack",
    category: "stickers",
    title: { uk: "«Стікер Пак»", en: "«Sticker Pack»" },
    price: 250,
    isAvailable: true,
    image: "/images/products/stickers2.JPG",
  },
];

const localizeProduct = (
  product: CatalogProduct,
  locale: Locale
): ProductView => ({
  slug: product.slug,
  category: product.category,
  title: product.title[locale],
  description: product.description?.[locale],
  price: product.price,
  isAvailable: product.isAvailable,
  sizes: product.sizes,
  image: product.image,
});

const localizeCategory = (
  category: CatalogCategory,
  locale: Locale
): CategoryView => ({
  slug: category.slug,
  name: category.name[locale],
  image: category.image,
  products: products
    .filter((product) => product.category === category.slug)
    .map((product) => localizeProduct(product, locale)),
});

export const getCategorySummaries = (locale: Locale): CategorySummary[] =>
  categories.map((category) => {
    const items = products.filter(
      (product) => product.category === category.slug
    );

    return {
      slug: category.slug,
      name: category.name[locale],
      image: category.image,
      count: items.length,
      isAnyAvailable: items.some((product) => product.isAvailable),
    };
  });

export const getCategoryView = (
  slug: string,
  locale: Locale
): CategoryView | null => {
  const category = categories.find((item) => item.slug === slug);

  return category ? localizeCategory(category, locale) : null;
};

export const getProductView = (
  categorySlug: string,
  productSlug: string,
  locale: Locale
): ProductView | null => {
  const product = products.find(
    (item) => item.category === categorySlug && item.slug === productSlug
  );

  return product ? localizeProduct(product, locale) : null;
};

export const getCategorySlugs = (): CategorySlug[] =>
  categories.map((category) => category.slug);

export const getProductSlugs = (categorySlug: string): string[] =>
  products
    .filter((product) => product.category === categorySlug)
    .map((product) => product.slug);
