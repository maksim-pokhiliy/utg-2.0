import type { SettlementChoice, WarehouseChoice } from "./delivery";

const SETTLEMENTS_ROUTE = "/api/np/settlements";
const WAREHOUSES_ROUTE = "/api/np/warehouses";
const THROTTLED_STATUS = 429;
const UNAVAILABLE_STATUS = 503;
const ABORT_ERROR_NAME = "AbortError";
const DIRECTORY_DEADLINE_MS = 10_000;
const RETRY_DELAY_MS = 400;

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

interface Deadline {
  signal: AbortSignal;
  isExpired: () => boolean;
  release: () => void;
}

const startDeadline = (caller: AbortSignal): Deadline => {
  const controller = new AbortController();
  const forward = (): void => {
    controller.abort();
  };

  let isExpired = false;

  const timer = setTimeout(() => {
    isExpired = true;
    controller.abort();
  }, DIRECTORY_DEADLINE_MS);

  if (caller.aborted) {
    forward();
  } else {
    caller.addEventListener("abort", forward, { once: true });
  }

  return {
    signal: controller.signal,
    isExpired: () => isExpired,
    release: () => {
      clearTimeout(timer);
      caller.removeEventListener("abort", forward);
    },
  };
};

const pause = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

interface Attempt<T> {
  outcome: DirectoryResult<T>;
  isRetryable: boolean;
}

const readAbortOutcome = <T>(deadline: Deadline): DirectoryResult<T> =>
  deadline.isExpired() ? DOWN : ABORTED;

const settled = <T>(
  outcome: DirectoryResult<T>,
  isRetryable = false
): Attempt<T> => ({ outcome, isRetryable });

const attempt = async <T>(
  url: string,
  deadline: Deadline,
  decode: (row: unknown) => T | null
): Promise<Attempt<T>> => {
  try {
    const response = await fetch(url, { signal: deadline.signal });

    if (response.status === THROTTLED_STATUS) {
      return settled(THROTTLED);
    }

    if (!response.ok) {
      return settled(DOWN, response.status === UNAVAILABLE_STATUS);
    }

    const items = decodeItems(await response.json(), decode);

    return settled(items === null ? DOWN : { kind: "ok", items });
  } catch (error) {
    if (error instanceof Error && error.name === ABORT_ERROR_NAME) {
      return settled(readAbortOutcome(deadline));
    }

    return settled(DOWN, true);
  }
};

const request = async <T>(
  url: string,
  signal: AbortSignal,
  decode: (row: unknown) => T | null
): Promise<DirectoryResult<T>> => {
  const deadline = startDeadline(signal);

  try {
    const first = await attempt(url, deadline, decode);

    if (!first.isRetryable || deadline.signal.aborted) {
      return first.outcome;
    }

    await pause(RETRY_DELAY_MS);

    if (deadline.signal.aborted) {
      return readAbortOutcome(deadline);
    }

    return (await attempt(url, deadline, decode)).outcome;
  } finally {
    deadline.release();
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
