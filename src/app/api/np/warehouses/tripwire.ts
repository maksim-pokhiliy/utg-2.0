import { capIdentifier } from "../client";

const UNKNOWN_CATEGORY_MESSAGE =
  "Unrecognised Nova Poshta warehouse category, its points are never offered:";
const MAX_REPORTED_CATEGORIES = 32;

export type CategoryTripwire = (category: string) => void;

export const createCategoryTripwire = (
  known: readonly string[]
): CategoryTripwire => {
  const reported = new Set<string>();

  return (category) => {
    const value = capIdentifier(category);

    if (
      known.some((entry) => entry === value) ||
      reported.has(value) ||
      reported.size >= MAX_REPORTED_CATEGORIES
    ) {
      return;
    }

    reported.add(value);

    try {
      console.warn(UNKNOWN_CATEGORY_MESSAGE, JSON.stringify(value));
    } catch {
      reported.delete(value);
    }
  };
};
