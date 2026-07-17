export type Locale = "uk" | "en";

export type CategorySlug = "tshirts" | "patches" | "stickers";

export interface LocalizedText {
  uk: string;
  en: string;
}

export interface CatalogProduct {
  slug: string;
  category: CategorySlug;
  title: LocalizedText;
  description?: LocalizedText;
  price: number;
  isAvailable: boolean;
  sizes?: string[];
  image: string;
}

export interface CatalogCategory {
  slug: CategorySlug;
  name: LocalizedText;
  image: string;
}

export interface ProductView {
  slug: string;
  category: CategorySlug;
  title: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  sizes?: string[];
  image: string;
}

export interface CategoryView {
  slug: CategorySlug;
  name: string;
  image: string;
  products: ProductView[];
}
