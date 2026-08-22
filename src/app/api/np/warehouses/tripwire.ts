import { capIdentifier } from "../client";

const UNKNOWN_CATEGORY_MESSAGE =
  "Unrecognised Nova Poshta warehouse category, its points are never offered:";
const MAX_REPORTED_CATEGORIES = 32;
const EMPTY_TEXT = "";

export type CategoryTripwire = (category: string) => void;

export const createCategoryTripwire = (
  known: readonly string[]
): CategoryTripwire => {
  const reported = new Set<string>();

  return (category) => {
    const value = capIdentifier(category);

    if (value === EMPTY_TEXT || known.some((entry) => entry === value)) {
      return;
    }

    const rendered = JSON.stringify(value);

    if (reported.has(rendered) || reported.size >= MAX_REPORTED_CATEGORIES) {
      return;
    }

    reported.add(rendered);

    try {
      console.warn(UNKNOWN_CATEGORY_MESSAGE, rendered);
    } catch {}
  };
};
