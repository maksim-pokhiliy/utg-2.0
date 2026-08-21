import { stripInvisibles } from "@root/utils/invisibles";

import { composeCacheKey, createDirectoryCache } from "../cache";
import {
  callNpDirectory,
  capIdentifier,
  capLabel,
  isRecord,
  readString,
} from "../client";
import { isCarrierRefused, type CarrierRefused } from "../refusal";

const WAREHOUSE_CACHE_TTL_MS = 300_000;
const WAREHOUSE_NEGATIVE_CACHE_TTL_MS = 30_000;
const WAREHOUSE_CACHE_MAX_ENTRIES = 250;
const WAREHOUSE_ROW_LIMIT = 30;
const WAREHOUSE_PAGE_SIZE = 500;
const WAREHOUSE_REQUEST_TIMEOUT_MS = 7000;
const WAREHOUSES_METHOD = "getWarehouses";
const FIRST_PAGE = "1";
const WORKING_STATUS = "Working";
const DENIED_FLAGS = ["1", "true"];
const DENIED_CODE = 1;
const KNOWN_CATEGORIES = [
  "Branch",
  "Postomat",
  "DropOff",
  "Store",
  "Fulfillment",
  "Cargo",
] as const;
const MAX_QUERY_LENGTH = 64;
const NUMBER_PREFIX = "№";
const WHITESPACE_PATTERN = /\s+/g;
const SINGLE_SPACE = " ";
const EMPTY_TEXT = "";
const CITY_REF_PATTERN = /^[0-9a-f-]+$/i;
const NOT_FOUND_INDEX = -1;
const EXACT_RANK = 0;
const PREFIX_RANK = 1;
const RESIDUAL_RANK = 2;

export type DeliveryMethod = "branch" | "postomat";

type WarehouseCategory = (typeof KNOWN_CATEGORIES)[number];

const NEVER_OFFERED_CATEGORIES = [
  "Cargo",
  "Fulfillment",
] as const satisfies readonly WarehouseCategory[];

type NeverOfferedCategory = (typeof NEVER_OFFERED_CATEGORIES)[number];

type OfferableCategory = Exclude<WarehouseCategory, NeverOfferedCategory>;

interface DecodedWarehouse {
  number: string;
  label: string;
  category: string;
  isWorking: boolean;
  isDenied: boolean;
}

interface RankedWarehouse extends DecodedWarehouse {
  rank: number;
}

export interface WarehouseItem {
  number: string;
  label: string;
}

interface WarehousePage {
  branch: readonly WarehouseItem[];
  postomat: readonly WarehouseItem[];
}

const METHOD_CATEGORIES = {
  branch: ["Branch", "DropOff", "Store"],
  postomat: ["Postomat"],
} as const satisfies Record<DeliveryMethod, readonly OfferableCategory[]>;

export const isDeliveryMethod = (
  value: string | null
): value is DeliveryMethod => value === "branch" || value === "postomat";

export const isCityRef = (value: string): boolean =>
  CITY_REF_PATTERN.test(value);

const isDeniedValue = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === DENIED_CODE) {
    return true;
  }

  return DENIED_FLAGS.includes(readString(value).toLowerCase());
};

const decodeWarehouse = (row: unknown): DecodedWarehouse | null => {
  if (!isRecord(row)) {
    return null;
  }

  const label = capLabel(readString(row.Description));
  const number = capIdentifier(readString(row.Number));

  if (label === EMPTY_TEXT || number === EMPTY_TEXT) {
    return null;
  }

  return {
    number,
    label,
    category: readString(row.CategoryOfWarehouse),
    isWorking: readString(row.WarehouseStatus) === WORKING_STATUS,
    isDenied: isDeniedValue(row.DenyToSelect),
  };
};

const decodeRows = (rows: readonly unknown[]): readonly DecodedWarehouse[] =>
  rows
    .map(decodeWarehouse)
    .filter((warehouse): warehouse is DecodedWarehouse => warehouse !== null);

const isSelectable = (
  warehouse: DecodedWarehouse,
  categories: readonly OfferableCategory[]
): boolean =>
  warehouse.isWorking &&
  !warehouse.isDenied &&
  categories.some((category) => category === warehouse.category);

const dedupeByCategoryNumber = (
  warehouses: readonly RankedWarehouse[]
): RankedWarehouse[] => {
  const seenPoints = new Set<string>();

  return warehouses.filter((warehouse) => {
    const point = composeCacheKey(warehouse.category, warehouse.number);

    if (seenPoints.has(point)) {
      return false;
    }

    seenPoints.add(point);

    return true;
  });
};

const normalizeQuery = (rawQuery: string | null): string => {
  const collapsed = stripInvisibles(rawQuery ?? EMPTY_TEXT)
    .replace(WHITESPACE_PATTERN, SINGLE_SPACE)
    .trim();
  const unprefixed = collapsed.startsWith(NUMBER_PREFIX)
    ? collapsed.slice(NUMBER_PREFIX.length).trimStart()
    : collapsed;

  return unprefixed.slice(0, MAX_QUERY_LENGTH);
};

const rankNumber = (number: string, needle: string): number => {
  if (number === needle) {
    return EXACT_RANK;
  }

  return number.startsWith(needle) ? PREFIX_RANK : RESIDUAL_RANK;
};

const rankWarehouses = (
  warehouses: readonly DecodedWarehouse[],
  query: string
): readonly RankedWarehouse[] => {
  if (query === EMPTY_TEXT) {
    return warehouses.map((warehouse) => ({
      ...warehouse,
      rank: RESIDUAL_RANK,
    }));
  }

  const needle = query.toLowerCase();

  return warehouses.map((warehouse) => ({
    ...warehouse,
    rank: rankNumber(warehouse.number.toLowerCase(), needle),
  }));
};

const cache = createDirectoryCache<WarehousePage>({
  ttlMs: WAREHOUSE_CACHE_TTL_MS,
  negativeTtlMs: WAREHOUSE_NEGATIVE_CACHE_TTL_MS,
  maxEntries: WAREHOUSE_CACHE_MAX_ENTRIES,
  isCacheable: (page) => page.branch.length > 0 || page.postomat.length > 0,
});

const buildMethodProperties = (
  cityRef: string,
  query: string
): Record<string, string> => {
  const properties: Record<string, string> = {
    CityRef: cityRef,
    Page: FIRST_PAGE,
    Limit: String(WAREHOUSE_PAGE_SIZE),
  };

  return query === EMPTY_TEXT
    ? properties
    : { ...properties, FindByString: query };
};

const findCategoryIndex = (
  categories: readonly OfferableCategory[],
  category: string
): number | null => {
  const index = categories.findIndex((offered) => offered === category);

  return index === NOT_FOUND_INDEX ? null : index;
};

const categoryPriority = (
  categories: readonly OfferableCategory[],
  category: string
): number => findCategoryIndex(categories, category) ?? categories.length;

const compareRanked = (
  categories: readonly OfferableCategory[],
  first: RankedWarehouse,
  second: RankedWarehouse
): number =>
  first.rank === second.rank
    ? categoryPriority(categories, first.category) -
      categoryPriority(categories, second.category)
    : first.rank - second.rank;

const selectCategory = (
  ranked: readonly RankedWarehouse[],
  categories: readonly OfferableCategory[]
): readonly WarehouseItem[] =>
  dedupeByCategoryNumber(
    ranked.filter((warehouse) => isSelectable(warehouse, categories))
  )
    .sort((first, second) => compareRanked(categories, first, second))
    .slice(0, WAREHOUSE_ROW_LIMIT)
    .map(({ number, label }) => ({ number, label }));

const loadWarehousePage = async (
  cityRef: string,
  query: string
): Promise<WarehousePage | null | CarrierRefused> => {
  const result = await callNpDirectory(
    WAREHOUSES_METHOD,
    buildMethodProperties(cityRef, query),
    AbortSignal.timeout(WAREHOUSE_REQUEST_TIMEOUT_MS)
  );

  if (isCarrierRefused(result)) {
    return result;
  }

  if (result.kind !== "rows") {
    return null;
  }

  const decoded = decodeRows(result.rows);

  if (result.rows.length > 0 && decoded.length === 0) {
    return null;
  }

  const ranked = rankWarehouses(decoded, query);

  return {
    branch: selectCategory(ranked, METHOD_CATEGORIES.branch),
    postomat: selectCategory(ranked, METHOD_CATEGORIES.postomat),
  };
};

export const listWarehouses = async (
  cityRef: string,
  method: DeliveryMethod,
  rawQuery: string | null
): Promise<readonly WarehouseItem[] | null> => {
  const cityKey = cityRef.toLowerCase();
  const query = normalizeQuery(rawQuery);
  const page = await cache.resolve(composeCacheKey(cityKey, query), () =>
    loadWarehousePage(cityKey, query)
  );

  return page === null || isCarrierRefused(page) ? null : page[method];
};
