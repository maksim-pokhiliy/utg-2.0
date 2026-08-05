import { createDirectoryCache } from "../cache";
import { callNpDirectory, isRecord, readString } from "../client";

const WAREHOUSE_CACHE_TTL_MS = 86_400_000;
const WAREHOUSE_CACHE_MAX_CITIES = 150;
const WAREHOUSE_ROW_LIMIT = 30;
const WAREHOUSE_PAGE_SIZE = 500;
const WAREHOUSE_MAX_PAGES = 10;
const WAREHOUSE_MERGE_TIMEOUT_MS = 7000;
const WORKING_STATUS = "Working";
const DENIED_FLAG = "1";
const DENIED_CODE = 1;
const MAX_QUERY_LENGTH = 64;
const MAX_LABEL_LENGTH = 256;
const NUMBER_PREFIX = "№";

export type DeliveryMethod = "branch" | "postomat";

type WarehouseCategory = "Branch" | "Postomat";

interface CachedWarehouse {
  number: string;
  label: string;
  category: WarehouseCategory;
}

export interface WarehouseItem {
  number: string;
  label: string;
}

const METHOD_CATEGORIES = {
  branch: "Branch",
  postomat: "Postomat",
} as const satisfies Record<DeliveryMethod, WarehouseCategory>;

export const isDeliveryMethod = (
  value: string | null
): value is DeliveryMethod => value === "branch" || value === "postomat";

const isWarehouseCategory = (value: string): value is WarehouseCategory =>
  value === "Branch" || value === "Postomat";

const isDeniedValue = (value: unknown): boolean =>
  value === DENIED_FLAG || value === DENIED_CODE || value === true;

const capLabel = (text: string): string => text.slice(0, MAX_LABEL_LENGTH);

const toWarehouse = (row: unknown): CachedWarehouse | null => {
  if (!isRecord(row)) {
    return null;
  }

  const label = capLabel(readString(row.Description));
  const number = readString(row.Number);

  if (label === "" || number === "") {
    return null;
  }

  if (readString(row.WarehouseStatus) !== WORKING_STATUS) {
    return null;
  }

  if (isDeniedValue(row.DenyToSelect)) {
    return null;
  }

  const category = readString(row.CategoryOfWarehouse);

  if (!isWarehouseCategory(category)) {
    return null;
  }

  return { number, label, category };
};

const decodeWarehouses = (rows: readonly unknown[]): CachedWarehouse[] => {
  const decoded: CachedWarehouse[] = [];

  for (const row of rows) {
    const warehouse = toWarehouse(row);

    if (warehouse !== null) {
      decoded.push(warehouse);
    }
  }

  return decoded;
};

const loadPage = async (
  cityRef: string,
  page: number,
  signal: AbortSignal
): Promise<readonly unknown[] | null> => {
  const result = await callNpDirectory(
    "getWarehouses",
    {
      CityRef: cityRef,
      Page: String(page),
      Limit: String(WAREHOUSE_PAGE_SIZE),
    },
    signal
  );

  return result.isSuccess ? result.rows : null;
};

const loadCityWarehouses = async (
  cityRef: string
): Promise<readonly CachedWarehouse[] | null> => {
  const signal = AbortSignal.timeout(WAREHOUSE_MERGE_TIMEOUT_MS);
  const merged: CachedWarehouse[] = [];

  for (let page = 1; page <= WAREHOUSE_MAX_PAGES; page += 1) {
    const rows = await loadPage(cityRef, page, signal);

    if (rows === null) {
      return null;
    }

    merged.push(...decodeWarehouses(rows));

    if (rows.length < WAREHOUSE_PAGE_SIZE) {
      return merged;
    }
  }

  return merged;
};

const cache = createDirectoryCache<readonly CachedWarehouse[]>({
  ttlMs: WAREHOUSE_CACHE_TTL_MS,
  maxEntries: WAREHOUSE_CACHE_MAX_CITIES,
  isCacheable: (warehouses) => warehouses.length > 0,
});

const normalizeQuery = (rawQuery: string | null): string => {
  const trimmed = (rawQuery ?? "").trim().toLowerCase();
  const unprefixed = trimmed.startsWith(NUMBER_PREFIX)
    ? trimmed.slice(NUMBER_PREFIX.length).trimStart()
    : trimmed;

  return unprefixed.slice(0, MAX_QUERY_LENGTH);
};

const rankWarehouses = (
  warehouses: readonly CachedWarehouse[],
  query: string
): readonly CachedWarehouse[] => {
  if (query === "") {
    return warehouses;
  }

  const exactMatches: CachedWarehouse[] = [];
  const prefixMatches: CachedWarehouse[] = [];
  const labelMatches: CachedWarehouse[] = [];

  for (const warehouse of warehouses) {
    if (warehouse.number === query) {
      exactMatches.push(warehouse);

      continue;
    }

    if (warehouse.number.startsWith(query)) {
      prefixMatches.push(warehouse);

      continue;
    }

    if (warehouse.label.toLowerCase().includes(query)) {
      labelMatches.push(warehouse);
    }
  }

  return [...exactMatches, ...prefixMatches, ...labelMatches];
};

const toWarehouseItem = (warehouse: CachedWarehouse): WarehouseItem => ({
  number: warehouse.number,
  label: warehouse.label,
});

export const listWarehouses = async (
  cityRef: string,
  method: DeliveryMethod,
  rawQuery: string | null
): Promise<readonly WarehouseItem[] | null> => {
  const warehouses = await cache.resolve(cityRef.toLowerCase(), () =>
    loadCityWarehouses(cityRef)
  );

  if (warehouses === null) {
    return null;
  }

  const category = METHOD_CATEGORIES[method];
  const available = warehouses.filter(
    (warehouse) => warehouse.category === category
  );

  return rankWarehouses(available, normalizeQuery(rawQuery))
    .slice(0, WAREHOUSE_ROW_LIMIT)
    .map(toWarehouseItem);
};
