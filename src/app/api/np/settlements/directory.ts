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
const INVISIBLE_PATTERN = /[\u00AD\u200B-\u200F\u2060-\u2064\uFEFF]/g;
const WHITESPACE_PATTERN = /\s+/g;
const SINGLE_SPACE = " ";
const EMPTY_TEXT = "";

export interface SettlementItem {
  ref: string;
  label: string;
  region?: string;
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
  (rawQuery ?? EMPTY_TEXT)
    .replace(INVISIBLE_PATTERN, EMPTY_TEXT)
    .trim()
    .toLowerCase()
    .replace(WHITESPACE_PATTERN, SINGLE_SPACE)
    .slice(0, MAX_QUERY_LENGTH);

const splitPresent = (present: string): SettlementLabel => {
  const separatorIndex = present.indexOf(PRESENT_SEPARATOR);

  if (separatorIndex === -1) {
    return { label: capLabel(present) };
  }

  return {
    label: capLabel(present.slice(0, separatorIndex)),
    region: capLabel(present.slice(separatorIndex + PRESENT_SEPARATOR.length)),
  };
};

const toSettlement = (row: unknown): SettlementItem | null => {
  if (!isRecord(row)) {
    return null;
  }

  const ref = capIdentifier(readString(row.DeliveryCity));

  if (ref === EMPTY_TEXT) {
    return null;
  }

  const present = readString(row.Present);

  if (present !== EMPTY_TEXT) {
    return { ref, ...splitPresent(present) };
  }

  const label = capLabel(readString(row.MainDescription));

  if (label === EMPTY_TEXT) {
    return null;
  }

  const region = capLabel(readString(row.Area));

  return region === EMPTY_TEXT ? { ref, label } : { ref, label, region };
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
