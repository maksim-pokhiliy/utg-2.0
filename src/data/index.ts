export type {
  Locale,
  CategorySlug,
  LocalizedText,
  CatalogProduct,
  CatalogCategory,
  ProductView,
  CategoryView,
} from "./catalog.types";

export {
  getCategoryViews,
  getCategoryView,
  getProductView,
  getCategorySlugs,
  getProductSlugs,
  resolveLocale,
} from "./catalog";
