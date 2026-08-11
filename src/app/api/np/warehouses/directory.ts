import { stripInvisibles } from "@root/utils/invisibles";

import { composeCacheKey, createDirectoryCache } from "../cache";
import {
  callNpDirectory,
  capIdentifier,
  capLabel,
  isRecord,
  readString,
} from "../client";

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
const KNOWN_CATEGORIES = ["Branch", "Postomat", "Cargo"];
const MAX_QUERY_LENGTH = 64;
const NUMBER_PREFIX = "№";
const WHITESPACE_PATTERN = /\s+/g;
const SINGLE_SPACE = " ";
const EMPTY_TEXT = "";
const CITY_REF_PATTERN = /^[0-9a-f-]+$/i;

export type DeliveryMethod = "branch" | "postomat";

type WarehouseCategory = "Branch" | "Postomat";

interface DecodedWarehouse {
  number: string;
  label: string;
  category: string;
  isWorking: boolean;
  isDenied: boolean;
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
  branch: "Branch",
  postomat: "Postomat",
} as const satisfies Record<DeliveryMethod, WarehouseCategory>;

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

const isKnownCategory = (category: string): boolean =>
  KNOWN_CATEGORIES.includes(category);

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
  category: WarehouseCategory
): boolean =>
  warehouse.isWorking && !warehouse.isDenied && warehouse.category === category;

const dedupeByNumber = (
  warehouses: readonly DecodedWarehouse[]
): readonly DecodedWarehouse[] => {
  const seenNumbers = new Set<string>();

  return warehouses.filter((warehouse) => {
    if (seenNumbers.has(warehouse.number)) {
      return false;
    }

    seenNumbers.add(warehouse.number);

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

const rankWarehouses = (
  warehouses: readonly DecodedWarehouse[],
  query: string
): readonly DecodedWarehouse[] => {
  if (query === EMPTY_TEXT) {
    return warehouses;
  }

  const needle = query.toLowerCase();
  const exactMatches: DecodedWarehouse[] = [];
  const prefixMatches: DecodedWarehouse[] = [];
  const labelMatches: DecodedWarehouse[] = [];

  for (const warehouse of warehouses) {
    const number = warehouse.number.toLowerCase();

    if (number === needle) {
      exactMatches.push(warehouse);

      continue;
    }

    if (number.startsWith(needle)) {
      prefixMatches.push(warehouse);

      continue;
    }

    labelMatches.push(warehouse);
  }

  return [...exactMatches, ...prefixMatches, ...labelMatches];
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

const selectCategory = (
  ranked: readonly DecodedWarehouse[],
  category: WarehouseCategory
): readonly WarehouseItem[] =>
  dedupeByNumber(
    ranked.filter((warehouse) => isSelectable(warehouse, category))
  )
    .slice(0, WAREHOUSE_ROW_LIMIT)
    .map(({ number, label }) => ({ number, label }));

const loadWarehousePage = async (
  cityRef: string,
  query: string
): Promise<WarehousePage | null> => {
  const result = await callNpDirectory(
    WAREHOUSES_METHOD,
    buildMethodProperties(cityRef, query),
    AbortSignal.timeout(WAREHOUSE_REQUEST_TIMEOUT_MS)
  );

  if (!result.isSuccess) {
    return null;
  }

  const decoded = decodeRows(result.rows);

  if (result.rows.length > 0 && decoded.length === 0) {
    return null;
  }

  if (
    decoded.length > 0 &&
    !decoded.some((warehouse) => isKnownCategory(warehouse.category))
  ) {
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

  return page === null ? null : page[method];
};
