import type { SettlementChoice, WarehouseChoice } from "./delivery";

const SETTLEMENTS_ROUTE = "/api/np/settlements";
const WAREHOUSES_ROUTE = "/api/np/warehouses";
const THROTTLED_STATUS = 429;
const ABORT_ERROR_NAME = "AbortError";

export type DirectoryResult<T> =
  | { kind: "ok"; items: readonly T[] }
  | { kind: "throttled" }
  | { kind: "down" }
  | { kind: "aborted" };

const THROTTLED = { kind: "throttled" } as const;
const DOWN = { kind: "down" } as const;
const ABORTED = { kind: "aborted" } as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const readOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;

const readCount = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

const toSettlement = (row: unknown): SettlementChoice | null => {
  if (!isRecord(row)) {
    return null;
  }

  const ref = readString(row.ref);
  const label = readString(row.label);

  if (ref === "" || label === "") {
    return null;
  }

  return {
    ref,
    label,
    region: readOptionalString(row.region),
    warehouseCount: readCount(row.warehouseCount),
    isCourierAllowed: row.isCourierAllowed !== false,
  };
};

const toWarehouse = (row: unknown): WarehouseChoice | null => {
  if (!isRecord(row)) {
    return null;
  }

  const number = readString(row.number);
  const label = readString(row.label);

  return number === "" || label === "" ? null : { number, label };
};

const decodeItems = <T>(
  payload: unknown,
  decode: (row: unknown) => T | null
): readonly T[] | null => {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    return null;
  }

  const decoded: T[] = [];

  for (const row of payload.items) {
    const item = decode(row);

    if (item !== null) {
      decoded.push(item);
    }
  }

  return decoded;
};

const request = async <T>(
  url: string,
  signal: AbortSignal,
  decode: (row: unknown) => T | null
): Promise<DirectoryResult<T>> => {
  try {
    const response = await fetch(url, { signal });

    if (response.status === THROTTLED_STATUS) {
      return THROTTLED;
    }

    if (!response.ok) {
      return DOWN;
    }

    const items = decodeItems(await response.json(), decode);

    return items === null ? DOWN : { kind: "ok", items };
  } catch (error) {
    if (error instanceof Error && error.name === ABORT_ERROR_NAME) {
      return ABORTED;
    }

    return DOWN;
  }
};

export const fetchSettlements = (
  query: string,
  signal: AbortSignal
): Promise<DirectoryResult<SettlementChoice>> =>
  request(
    `${SETTLEMENTS_ROUTE}?q=${encodeURIComponent(query)}`,
    signal,
    toSettlement
  );

export const fetchWarehouses = (
  cityRef: string,
  method: "branch" | "postomat",
  query: string,
  signal: AbortSignal
): Promise<DirectoryResult<WarehouseChoice>> =>
  request(
    `${WAREHOUSES_ROUTE}?city=${encodeURIComponent(cityRef)}&method=${method}&q=${encodeURIComponent(query)}`,
    signal,
    toWarehouse
  );
