import { capIdentifier } from "../client";

const KNOWN_CATEGORIES = [
  "Branch",
  "Postomat",
  "DropOff",
  "Store",
  "Fulfillment",
  "Cargo",
] as const;

const UNKNOWN_CATEGORY_MESSAGE =
  "Unrecognised Nova Poshta warehouse category, its points are never offered:";

const reportedCategories = new Set<string>();

export type WarehouseCategory = (typeof KNOWN_CATEGORIES)[number];

export const reportUnknownCategory = (category: string): void => {
  const value = capIdentifier(category);

  if (
    KNOWN_CATEGORIES.some((known) => known === value) ||
    reportedCategories.has(value)
  ) {
    return;
  }

  reportedCategories.add(value);

  console.warn(UNKNOWN_CATEGORY_MESSAGE, value);
};
