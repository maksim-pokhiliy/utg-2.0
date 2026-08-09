import { stripInvisibles } from "@root/utils/invisibles";

import { createDirectoryCache } from "../cache";
import {
  callNpDirectory,
  capIdentifier,
  capLabel,
  isRecord,
  readString,
} from "../client";

const SETTLEMENT_CACHE_TTL_MS = 300_000;
const SETTLEMENT_NEGATIVE_CACHE_TTL_MS = 30_000;
const SETTLEMENT_CACHE_MAX_ENTRIES = 2000;
const SETTLEMENT_ROW_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 64;
const PRESENT_SEPARATOR = ", ";
const SETTLEMENTS_METHOD = "searchSettlements";
const FIRST_PAGE = "1";
const WHITESPACE_PATTERN = /\s+/g;
const SINGLE_SPACE = " ";
const EMPTY_TEXT = "";
const UNKNOWN_WAREHOUSE_COUNT = null;
const DIGITS_PATTERN = /^\d+$/;
const DENIED_FLAGS = ["0", "false"];
const DENIED_CODE = 0;
const TRAILING_SEPARATOR = /[\s,]+$/;

export interface SettlementItem {
  ref: string;
  label: string;
  region?: string;
  warehouseCount: number | null;
  isCourierAllowed: boolean;
}

interface SettlementLabel {
  label: string;
  region?: string;
}

const cache = createDirectoryCache<readonly SettlementItem[]>({
  ttlMs: SETTLEMENT_CACHE_TTL_MS,
  negativeTtlMs: SETTLEMENT_NEGATIVE_CACHE_TTL_MS,
  maxEntries: SETTLEMENT_CACHE_MAX_ENTRIES,
});

const normalizeQuery = (rawQuery: string | null): string =>
  stripInvisibles(rawQuery ?? EMPTY_TEXT)
    .trim()
    .toLowerCase()
    .replace(WHITESPACE_PATTERN, SINGLE_SPACE)
    .slice(0, MAX_QUERY_LENGTH);

const readWarehouseCount = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0
      ? value
      : UNKNOWN_WAREHOUSE_COUNT;
  }

  const text = readString(value);

  return DIGITS_PATTERN.test(text) ? Number(text) : UNKNOWN_WAREHOUSE_COUNT;
};

const readCourierAllowed = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === DENIED_CODE) {
    return false;
  }

  return !DENIED_FLAGS.includes(readString(value).toLowerCase());
};

const splitPresent = (present: string): SettlementLabel => {
  const separatorIndex = present.indexOf(PRESENT_SEPARATOR);
  const hasRegion = separatorIndex !== -1;
  const label = capLabel(
    (hasRegion ? present.slice(0, separatorIndex) : present).replace(
      TRAILING_SEPARATOR,
      EMPTY_TEXT
    )
  );
  const region = hasRegion
    ? capLabel(present.slice(separatorIndex + PRESENT_SEPARATOR.length).trim())
    : EMPTY_TEXT;

  return region === EMPTY_TEXT ? { label } : { label, region };
};

const readComposedLabel = (
  row: Record<string, unknown>
): SettlementLabel | null => {
  const present = readString(row.Present);
  const split = present === EMPTY_TEXT ? null : splitPresent(present);

  if (split !== null && split.label !== EMPTY_TEXT) {
    return split;
  }

  const label = capLabel(readString(row.MainDescription));

  if (label === EMPTY_TEXT) {
    return null;
  }

  const region = capLabel(readString(row.Area));

  return region === EMPTY_TEXT ? { label } : { label, region };
};

const toSettlement = (row: unknown): SettlementItem | null => {
  if (!isRecord(row)) {
    return null;
  }

  const ref = capIdentifier(readString(row.DeliveryCity));

  if (ref === EMPTY_TEXT) {
    return null;
  }

  const composed = readComposedLabel(row);

  if (composed === null) {
    return null;
  }

  return {
    ref,
    ...composed,
    warehouseCount: readWarehouseCount(row.Warehouses),
    isCourierAllowed: readCourierAllowed(row.AddressDeliveryAllowed),
  };
};

const readAddresses = (rows: readonly unknown[]): readonly unknown[] => {
  const container = rows[0];

  if (!isRecord(container) || !Array.isArray(container.Addresses)) {
    return [];
  }

  return container.Addresses;
};

const decodeSettlements = (
  addresses: readonly unknown[]
): readonly SettlementItem[] =>
  addresses
    .map(toSettlement)
    .filter((settlement): settlement is SettlementItem => settlement !== null)
    .slice(0, SETTLEMENT_ROW_LIMIT);

const loadSettlements = async (
  query: string
): Promise<readonly SettlementItem[] | null> => {
  const result = await callNpDirectory(SETTLEMENTS_METHOD, {
    CityName: query,
    Limit: String(SETTLEMENT_ROW_LIMIT),
    Page: FIRST_PAGE,
  });

  if (!result.isSuccess || result.rows.length === 0) {
    return null;
  }

  const addresses = readAddresses(result.rows);
  const settlements = decodeSettlements(addresses);

  return addresses.length > 0 && settlements.length === 0 ? null : settlements;
};

export const searchSettlements = async (
  rawQuery: string | null
): Promise<readonly SettlementItem[] | null> => {
  const query = normalizeQuery(rawQuery);

  if (query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  return cache.resolve(query, () => loadSettlements(query));
};
