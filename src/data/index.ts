export type {
  Locale,
  CategorySlug,
  LocalizedText,
  CatalogProduct,
  CatalogCategory,
  ProductView,
  CategoryView,
  CategorySummary,
} from "./catalog.types";

export {
  getCategorySummaries,
  getCategoryView,
  getProductView,
  getCategorySlugs,
  getCategoryName,
  getProductSlugs,
} from "./catalog";
