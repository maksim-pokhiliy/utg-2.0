import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { NextRequest } from "next/server";

import type { FetchStub } from "../../../../support/apiTest";
import {
  expectUpstreamOnly,
  isRecord,
  jsonResponse,
  stubUpstream,
} from "../../../../support/apiTest";

const BASE_TIME = new Date("2026-01-01T00:00:00.000Z").getTime();

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_MODEL_NAME = "Address";
const NP_METHOD = "getWarehouses";
const NP_API_KEY_NAME = "NOVA_POSHTA_API_KEY";
const FAKE_API_KEY = "np-test-key";
const NP_HOST_FRAGMENT = "novaposhta";

const ROUTE_URL = "https://example.test/api/np/warehouses";
const FORWARDED_FOR_HEADER = "x-forwarded-for";
const RETRY_AFTER_HEADER = "Retry-After";
const CLIENT_IP = "203.0.113.9";

const CITY_PARAM = "city";
const METHOD_PARAM = "method";
const QUERY_PARAM = "q";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const SHOUTED_CITY_REF = CITY_REF.toUpperCase();
const SECOND_CITY_REF = "db5c88f5-391c-11dd-90d9-001a92567626";
const CITY_INDEX_WIDTH = 3;
const CITY_INDEX_PAD = "0";
const CITY_REF_PREFIX = CITY_REF.slice(0, CITY_REF.length - CITY_INDEX_WIDTH);
const BRANCH_METHOD = "branch";
const POSTOMAT_METHOD = "postomat";
const UNKNOWN_METHOD = "garbage";
const MAX_CITY_REF_LENGTH = 64;
const BLANK_CITY = "   ";
const OVERLONG_CITY = "c".repeat(MAX_CITY_REF_LENGTH + 1);

const PAGE_SIZE = 500;
const MAX_PAGES = 10;
const ROW_LIMIT = 30;
const BULK_ROW_COUNT = 60;
const CAP_OVERFLOW_ROW_COUNT = 119;
const LAST_PAGE_ROW_COUNT = 3;
const MERGE_TIMEOUT_MS = 7000;
const MERGE_SIGNAL_COUNT = 1;
const FAILED_MERGE_CALL_COUNT = 2;
const REPEATED_BRANCH_COUNT = 11;
const REPEATED_PAGE_CALL_COUNT = 3;
const UNDECODABLE_ROW_COUNT = 4;
const MAX_CONCURRENT_MERGES = 4;
const CONCURRENT_CITY_COUNT = 5;
const REFUSED_MERGE_COUNT = CONCURRENT_CITY_COUNT - MAX_CONCURRENT_MERGES;
const WAREHOUSE_CACHE_TTL_MS = 86_400_000;
const WAREHOUSE_TTL_MERGE_COUNT = 2;
const SEPARATE_CITY_MERGE_COUNT = 2;
const CACHE_MAX_CITIES = 150;
const CACHED_CITY_COUNT = CACHE_MAX_CITIES + 1;
const EVICTION_RELOAD_COUNT = CACHED_CITY_COUNT + 1;
const EVICTED_CITY_INDEX = 0;
const RETAINED_CITY_INDEX = 1;
const LABEL_CAP = 256;
const IDENTIFIER_CAP = 64;
const OVERLONG_LABEL_LENGTH = 900;
const OVERLONG_NUMBER_LENGTH = 300;
const TAB_CHAR_CODE = 9;
const NEWLINE_CHAR_CODE = 10;
const DIRECTORY_MAX_REQUESTS = 60;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

const OK_STATUS = 200;
const INVALID_REQUEST_STATUS = 400;
const TOO_MANY_REQUESTS_STATUS = 429;
const BAD_GATEWAY_STATUS = 502;
const UNAVAILABLE_STATUS = 503;

const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const INVALID_REQUEST_BODY = '{"error":"Invalid request"}';
const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';

const FORCE_DYNAMIC = "force-dynamic";
const ITEM_KEYS = ["label", "number"];
const HIDDEN_FIELDS = [
  "DenyToSelect",
  "WarehouseStatus",
  "CategoryOfWarehouse",
  "TypeOfWarehouse",
  NP_HOST_FRAGMENT,
];

const BRANCH_CATEGORY = "Branch";
const POSTOMAT_CATEGORY = "Postomat";
const CARGO_CATEGORY = "Cargo";
const WORKING_STATUS = "Working";
const CLOSED_STATUS = "Closed";
const ALLOWED_FLAG = "0";
const DENIED_FLAG = "1";
const DENIED_CODE = 1;
const DENIED_DECISION = true;
const TYPE_OF_WAREHOUSE_REF = "9a68df70-0267-42a8-bb5c-37f427e36ee4";

const CAPTURED_NUMBER = "1";
const CAPTURED_LABEL = "Відділення №1: вул. Пирогівський шлях, 135";
const POSTOMAT_NUMBER = "2";
const DENIED_NUMBER = "3";
const CLOSED_NUMBER = "4";
const CARGO_NUMBER = "5";
const NAMELESS_NUMBER = "6";
const NUMERIC_DENIED_NUMBER = "7";
const BOOLEAN_DENIED_NUMBER = "8";
const STRING_ALLOWED_NUMBER = "9";
const PADDED_DENIED_NUMBER = "21";
const TRAILING_DENIED_NUMBER = "22";
const WRAPPED_DENIED_NUMBER = "23";
const PADDED_ALLOWED_NUMBER = "24";

const PADDED_DENIED_FLAG = ` ${DENIED_FLAG}`;
const TRAILING_DENIED_FLAG = `${DENIED_FLAG} `;
const WRAPPED_DENIED_FLAG = `${String.fromCharCode(
  TAB_CHAR_CODE
)}${DENIED_FLAG}${String.fromCharCode(NEWLINE_CHAR_CODE)}`;

const OVERLONG_NUMBER = "9".repeat(OVERLONG_NUMBER_LENGTH);
const CAPPED_NUMBER = "9".repeat(IDENTIFIER_CAP);

const STREET_NUMBER = "41";
const OTHER_STREET_NUMBER = "42";
const FAR_STREET_NUMBER = "43";
const STREET_LABEL = "Відділення №41: вул. Хрещатик, 22";
const OTHER_STREET_LABEL = "Відділення №42: вул. Січових Стрільців, 8";
const FAR_STREET_LABEL = "Відділення №43: просп. Науки, 3";
const STREET_QUERY = "хрещатик";
const SHOUTED_STREET_QUERY = "ХРЕЩАТИК";

const OVERLONG_LABEL_NUMBER = "77";
const OVERLONG_LABEL = "в".repeat(OVERLONG_LABEL_LENGTH);
const CAPPED_LABEL = "в".repeat(LABEL_CAP);

const CAP_OVERFLOW_QUERY = "1";
const CAP_OVERFLOW_FIRST_NUMBER = "1";

const SECOND_CITY_NUMBER = "301";
const SECOND_CITY_LABEL = "Відділення №301: вул. Соборності, 4";

const EXACT_NUMBER = "12";
const PREFIXED_NUMBER = "120";
const ADDRESS_NUMBER = "3";
const EXACT_LABEL = "Відділення №12: вул. Соборна, 5";
const PREFIXED_LABEL = "Відділення №120: вул. Миру, 1";
const ADDRESS_LABEL = "Відділення №3: вул. 12-го Квітня, 7";
const BARE_QUERY = "12";
const NUMBER_SIGN_QUERY = "№12";
const EMPTY_QUERY = "";
const RANKED_NUMBERS = [EXACT_NUMBER, PREFIXED_NUMBER, ADDRESS_NUMBER];

interface WarehouseRow {
  Description?: string;
  Number: string;
  CategoryOfWarehouse: string;
  WarehouseStatus: string;
  DenyToSelect: string | number | boolean;
  TypeOfWarehouse: string;
}

type PageResponder = () => Response;

type RouteHandler = (request: NextRequest) => Promise<Response>;

interface ResponseGate {
  respond: () => Promise<Response>;
  release: () => void;
}

const loadRoute = () => import("@root/app/api/np/warehouses/route");

const readText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const buildRow = (
  number: string,
  overrides: Partial<WarehouseRow> = {}
): WarehouseRow => ({
  Description: `Відділення №${number}: вул. Тестова, ${number}`,
  Number: number,
  CategoryOfWarehouse: BRANCH_CATEGORY,
  WarehouseStatus: WORKING_STATUS,
  DenyToSelect: ALLOWED_FLAG,
  TypeOfWarehouse: TYPE_OF_WAREHOUSE_REF,
  ...overrides,
});

const buildAscendingPage = (
  size: number,
  firstNumber: number,
  overrides: Partial<WarehouseRow> = {}
): WarehouseRow[] => {
  const rows: WarehouseRow[] = [];

  for (let offset = 0; offset < size; offset += 1) {
    rows.push(buildRow(String(firstNumber + offset), overrides));
  }

  return rows;
};

const buildDescendingPage = (size: number): WarehouseRow[] => {
  const rows: WarehouseRow[] = [];

  for (let number = size; number > 0; number -= 1) {
    rows.push(buildRow(String(number)));
  }

  return rows;
};

const buildDescendingNumbers = (from: number, count: number): string[] => {
  const numbers: string[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    numbers.push(String(from - offset));
  }

  return numbers;
};

const buildAscendingNumbers = (from: number, count: number): string[] => {
  const numbers: string[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    numbers.push(String(from + offset));
  }

  return numbers;
};

const FIRST_PAGE_ROWS = buildAscendingPage(PAGE_SIZE, 1);
const LAST_PAGE_ROWS = buildAscendingPage(LAST_PAGE_ROW_COUNT, PAGE_SIZE + 1, {
  CategoryOfWarehouse: POSTOMAT_CATEGORY,
});
const LAST_PAGE_NUMBERS = LAST_PAGE_ROWS.map((row) => row.Number);
const DESCENDING_ROWS = buildDescendingPage(BULK_ROW_COUNT);
const CAP_OVERFLOW_ROWS = buildDescendingPage(CAP_OVERFLOW_ROW_COUNT);

const MIXED_ROWS: readonly WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER, { Description: CAPTURED_LABEL }),
  buildRow(POSTOMAT_NUMBER, { CategoryOfWarehouse: POSTOMAT_CATEGORY }),
  buildRow(DENIED_NUMBER, { DenyToSelect: DENIED_FLAG }),
  buildRow(CLOSED_NUMBER, { WarehouseStatus: CLOSED_STATUS }),
  buildRow(CARGO_NUMBER, { CategoryOfWarehouse: CARGO_CATEGORY }),
  buildRow(NAMELESS_NUMBER, { Description: undefined }),
];

const EMPTY_ROWS: readonly WarehouseRow[] = [];

const RANKING_ROWS: readonly WarehouseRow[] = [
  buildRow(EXACT_NUMBER, { Description: EXACT_LABEL }),
  buildRow(ADDRESS_NUMBER, { Description: ADDRESS_LABEL }),
  buildRow(PREFIXED_NUMBER, { Description: PREFIXED_LABEL }),
];

const DENY_FLAVOUR_ROWS: readonly WarehouseRow[] = [
  buildRow(NUMERIC_DENIED_NUMBER, { DenyToSelect: DENIED_CODE }),
  buildRow(BOOLEAN_DENIED_NUMBER, { DenyToSelect: DENIED_DECISION }),
  buildRow(STRING_ALLOWED_NUMBER, { DenyToSelect: ALLOWED_FLAG }),
];

const PADDED_DENY_ROWS: readonly WarehouseRow[] = [
  buildRow(PADDED_DENIED_NUMBER, { DenyToSelect: PADDED_DENIED_FLAG }),
  buildRow(TRAILING_DENIED_NUMBER, { DenyToSelect: TRAILING_DENIED_FLAG }),
  buildRow(WRAPPED_DENIED_NUMBER, { DenyToSelect: WRAPPED_DENIED_FLAG }),
  buildRow(PADDED_ALLOWED_NUMBER, { DenyToSelect: ALLOWED_FLAG }),
];

const OVERLONG_NUMBER_ROWS: readonly WarehouseRow[] = [
  buildRow(OVERLONG_NUMBER),
];

const REPEATED_PAGE_ROWS: readonly WarehouseRow[] = [
  ...buildAscendingPage(REPEATED_BRANCH_COUNT, 1),
  ...buildAscendingPage(
    PAGE_SIZE - REPEATED_BRANCH_COUNT,
    REPEATED_BRANCH_COUNT + 1,
    { CategoryOfWarehouse: CARGO_CATEGORY }
  ),
];

const REPEATED_BRANCH_NUMBERS = buildAscendingNumbers(1, REPEATED_BRANCH_COUNT);

const UNDECODABLE_ROWS: readonly unknown[] = buildAscendingPage(
  UNDECODABLE_ROW_COUNT,
  1
).map((row, index) => ({ ...row, Number: index + 1 }));

const ADDRESS_FILTER_ROWS: readonly WarehouseRow[] = [
  buildRow(STREET_NUMBER, { Description: STREET_LABEL }),
  buildRow(OTHER_STREET_NUMBER, { Description: OTHER_STREET_LABEL }),
  buildRow(FAR_STREET_NUMBER, { Description: FAR_STREET_LABEL }),
];

const OVERLONG_LABEL_ROWS: readonly WarehouseRow[] = [
  buildRow(OVERLONG_LABEL_NUMBER, { Description: OVERLONG_LABEL }),
];

const SECOND_CITY_ROWS: readonly WarehouseRow[] = [
  buildRow(SECOND_CITY_NUMBER, { Description: SECOND_CITY_LABEL }),
];

const BRANCH_PARAMS = {
  [CITY_PARAM]: CITY_REF,
  [METHOD_PARAM]: BRANCH_METHOD,
};
const POSTOMAT_PARAMS = {
  [CITY_PARAM]: CITY_REF,
  [METHOD_PARAM]: POSTOMAT_METHOD,
};
const SHOUTED_BRANCH_PARAMS = {
  [CITY_PARAM]: SHOUTED_CITY_REF,
  [METHOD_PARAM]: BRANCH_METHOD,
};
const SECOND_CITY_PARAMS = {
  [CITY_PARAM]: SECOND_CITY_REF,
  [METHOD_PARAM]: BRANCH_METHOD,
};

const INVALID_PARAMS: readonly Record<string, string>[] = [
  { [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: BLANK_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: OVERLONG_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: CITY_REF },
  { [CITY_PARAM]: CITY_REF, [METHOD_PARAM]: UNKNOWN_METHOD },
];

const buildRequestUrl = (params: Record<string, string>): string =>
  `${ROUTE_URL}?${new URLSearchParams(params).toString()}`;

const buildRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(buildRequestUrl(params), {
    headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP },
  });

const buildAnonymousRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(buildRequestUrl(params));

const buildCityParams = (index: number): Record<string, string> => ({
  ...BRANCH_PARAMS,
  [CITY_PARAM]: `${CITY_REF_PREFIX}${String(index).padStart(
    CITY_INDEX_WIDTH,
    CITY_INDEX_PAD
  )}`,
});

const startCityMerges = (
  handler: RouteHandler,
  cityCount: number
): Promise<Response>[] => {
  const pending: Promise<Response>[] = [];

  for (let index = 0; index < cityCount; index += 1) {
    pending.push(handler(buildRequest(buildCityParams(index))));
  }

  return pending;
};

const countStatus = (statuses: readonly number[], status: number): number =>
  statuses.filter((candidate) => candidate === status).length;

const npResponse = (rows: readonly unknown[]): Response =>
  jsonResponse({ success: true, data: rows }, OK_STATUS);

const okPage =
  (rows: readonly unknown[]): PageResponder =>
  () =>
    npResponse(rows);

const failedPage = (): PageResponder => () =>
  new Response(null, { status: BAD_GATEWAY_STATUS });

const createResponseGate = (rows: readonly unknown[]): ResponseGate => {
  let open: () => void = () => undefined;

  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });

  return {
    respond: () => opened.then(() => npResponse(rows)),
    release: () => {
      open();
    },
  };
};

const stubHeldPages = (gate: ResponseGate): Mock<FetchStub> =>
  stubUpstream(gate.respond);

const stubPages = (responders: readonly PageResponder[]): Mock<FetchStub> => {
  let callIndex = 0;

  return stubUpstream(() => {
    const responder = responders[Math.min(callIndex, responders.length - 1)];

    callIndex += 1;

    return Promise.resolve(responder());
  });
};

const readBodyEnvelope = (init: RequestInit | undefined): unknown => {
  const body = init?.body;

  return typeof body === "string" ? JSON.parse(body) : null;
};

const readEnvelope = (fetchStub: Mock<FetchStub>, callIndex: number): unknown =>
  readBodyEnvelope(fetchStub.mock.calls[callIndex][1]);

const readRequestedCity = (init: RequestInit | undefined): string => {
  const envelope = readBodyEnvelope(init);

  if (!isRecord(envelope) || !isRecord(envelope.methodProperties)) {
    return "";
  }

  return readText(envelope.methodProperties.CityRef);
};

const stubCityPages = (
  rowsByCity: ReadonlyMap<string, readonly unknown[]>
): Mock<FetchStub> =>
  stubUpstream((_input, init) =>
    Promise.resolve(
      npResponse(rowsByCity.get(readRequestedCity(init)) ?? EMPTY_ROWS)
    )
  );

const buildEnvelope = (page: number, cityRef: string = CITY_REF): unknown => ({
  apiKey: FAKE_API_KEY,
  modelName: NP_MODEL_NAME,
  calledMethod: NP_METHOD,
  methodProperties: {
    CityRef: cityRef,
    Page: String(page),
    Limit: String(PAGE_SIZE),
  },
});

const readSignal = (
  fetchStub: Mock<FetchStub>,
  callIndex: number
): AbortSignal | null | undefined => fetchStub.mock.calls[callIndex][1]?.signal;

const parseItems = (body: string): readonly unknown[] => {
  const payload: unknown = JSON.parse(body);

  if (!isRecord(payload)) {
    return [];
  }

  const { items } = payload;

  return Array.isArray(items) ? items : [];
};

const readItems = async (response: Response): Promise<readonly unknown[]> =>
  parseItems(await response.text());

const readNumbers = (items: readonly unknown[]): string[] =>
  items.map((item) => (isRecord(item) ? readText(item.number) : ""));

const readLabels = (items: readonly unknown[]): string[] =>
  items.map((item) => (isRecord(item) ? readText(item.label) : ""));

const readItemKeys = (item: unknown): string[] =>
  isRecord(item) ? Object.keys(item).sort() : [];

const expectNoInternals = (body: string): void => {
  for (const field of HIDDEN_FIELDS) {
    expect(body).not.toContain(field);
  }
};

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv(NP_API_KEY_NAME, FAKE_API_KEY);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET /api/np/warehouses", () => {
  it("answers 400 without touching the network for every invalid city or method", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const statuses: number[] = [];
    const bodies: string[] = [];

    for (const params of INVALID_PARAMS) {
      const response = await GET(buildRequest(params));

      statuses.push(response.status);
      bodies.push(await response.text());
    }

    expect(statuses).toEqual(
      Array(INVALID_PARAMS.length).fill(INVALID_REQUEST_STATUS)
    );
    expect(bodies).toEqual(
      Array(INVALID_PARAMS.length).fill(INVALID_REQUEST_BODY)
    );
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers 503 without touching the network when the api key is absent", async () => {
    vi.stubEnv(NP_API_KEY_NAME, undefined);

    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers 503 and remembers the failure briefly when a page of the merge fails", async () => {
    const fetchStub = stubPages([
      okPage(FIRST_PAGE_ROWS),
      failedPage(),
      okPage(MIXED_ROWS),
    ]);
    const { GET } = await loadRoute();

    const failed = await GET(buildRequest(BRANCH_PARAMS));
    const retried = await GET(buildRequest(BRANCH_PARAMS));

    expect(failed.status).toBe(UNAVAILABLE_STATUS);
    expect(await failed.text()).toBe(UNAVAILABLE_BODY);
    expect(retried.status).toBe(UNAVAILABLE_STATUS);
    expect(await retried.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(FAILED_MERGE_CALL_COUNT);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("keeps no cache entry for a city np answers with nothing usable", async () => {
    const fetchStub = stubPages([okPage(EMPTY_ROWS), okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const empty = await GET(buildRequest(BRANCH_PARAMS));
    const emptyItems = await readItems(empty);
    const refilled = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(empty.status).toBe(OK_STATUS);
    expect(emptyItems).toEqual([]);
    expect(readNumbers(refilled)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(readEnvelope(fetchStub, 1)).toEqual(buildEnvelope(1));
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("collapses two concurrent cold requests into one upstream merge", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const [branches, postomats] = await Promise.all([
      GET(buildRequest(BRANCH_PARAMS)),
      GET(buildRequest(POSTOMAT_PARAMS)),
    ]);

    expect(readNumbers(await readItems(branches))).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(await readItems(postomats))).toEqual([POSTOMAT_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("merges the pages of one city under a single deadline and stops at the short page", async () => {
    const timeoutSignals = vi.spyOn(AbortSignal, "timeout");
    const fetchStub = stubPages([
      okPage(FIRST_PAGE_ROWS),
      okPage(LAST_PAGE_ROWS),
    ]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(POSTOMAT_PARAMS));
    const items = await readItems(response);

    expect(response.status).toBe(OK_STATUS);
    expect(readNumbers(items)).toEqual(LAST_PAGE_NUMBERS);
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(readEnvelope(fetchStub, 0)).toEqual(buildEnvelope(1));
    expect(readEnvelope(fetchStub, 1)).toEqual(buildEnvelope(2));
    expect(readSignal(fetchStub, 0)).toBeInstanceOf(AbortSignal);
    expect(readSignal(fetchStub, 0)).toBe(readSignal(fetchStub, 1));
    expect(timeoutSignals).toHaveBeenCalledTimes(MERGE_SIGNAL_COUNT);
    expect(timeoutSignals).toHaveBeenCalledWith(MERGE_TIMEOUT_MS);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("refuses the merge at the page cap instead of serving a truncated city", async () => {
    const fetchStub = stubPages([okPage(FIRST_PAGE_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(MAX_PAGES);
    expect(readEnvelope(fetchStub, MAX_PAGES - 1)).toEqual(
      buildEnvelope(MAX_PAGES)
    );
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("counts a repeated page once when np ignores the page parameter", async () => {
    const fetchStub = stubPages([
      okPage(REPEATED_PAGE_ROWS),
      okPage(REPEATED_PAGE_ROWS),
      okPage(EMPTY_ROWS),
    ]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual(REPEATED_BRANCH_NUMBERS);
    expect(fetchStub).toHaveBeenCalledTimes(REPEATED_PAGE_CALL_COUNT);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when a page arrives full of rows it can decode none of", async () => {
    const fetchStub = stubPages([okPage(UNDECODABLE_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("refuses a fifth concurrent city merge instead of fanning out", async () => {
    const gate = createResponseGate(MIXED_ROWS);
    const fetchStub = stubHeldPages(gate);
    const { GET } = await loadRoute();

    const pending = startCityMerges(GET, CONCURRENT_CITY_COUNT);

    gate.release();

    const statuses = (await Promise.all(pending)).map(
      (response) => response.status
    );

    expect(countStatus(statuses, OK_STATUS)).toBe(MAX_CONCURRENT_MERGES);
    expect(countStatus(statuses, UNAVAILABLE_STATUS)).toBe(REFUSED_MERGE_COUNT);
    expect(fetchStub).toHaveBeenCalledTimes(MAX_CONCURRENT_MERGES);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("serves a city it has already merged while the concurrency cap is saturated", async () => {
    const warmFetch = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const warmed = await GET(buildRequest(BRANCH_PARAMS));

    expect(warmed.status).toBe(OK_STATUS);
    expect(warmFetch).toHaveBeenCalledTimes(1);

    const gate = createResponseGate(MIXED_ROWS);
    const heldFetch = stubHeldPages(gate);
    const pending = startCityMerges(GET, MAX_CONCURRENT_MERGES);

    const served = await GET(buildRequest(BRANCH_PARAMS));
    const items = await readItems(served);

    gate.release();
    await Promise.all(pending);

    expect(served.status).toBe(OK_STATUS);
    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(heldFetch).toHaveBeenCalledTimes(MAX_CONCURRENT_MERGES);
    expectUpstreamOnly(heldFetch.mock.calls, NP_API_URL);
  });

  it("forgets a city it refused at the concurrency cap instead of remembering a failure", async () => {
    const gate = createResponseGate(MIXED_ROWS);
    const heldFetch = stubHeldPages(gate);
    const { GET } = await loadRoute();

    const pending = startCityMerges(GET, MAX_CONCURRENT_MERGES);
    const refused = await GET(buildRequest(BRANCH_PARAMS));

    gate.release();
    await Promise.all(pending);

    expect(refused.status).toBe(UNAVAILABLE_STATUS);
    expect(await refused.text()).toBe(UNAVAILABLE_BODY);
    expect(heldFetch).toHaveBeenCalledTimes(MAX_CONCURRENT_MERGES);

    const retryFetch = stubPages([okPage(MIXED_ROWS)]);
    const retried = await GET(buildRequest(BRANCH_PARAMS));

    expect(retried.status).toBe(OK_STATUS);
    expect(readNumbers(await readItems(retried))).toEqual([CAPTURED_NUMBER]);
    expect(retryFetch).toHaveBeenCalledTimes(1);
    expect(readEnvelope(retryFetch, 0)).toEqual(buildEnvelope(1));
    expectUpstreamOnly(retryFetch.mock.calls, NP_API_URL);
  });

  it("merges every city on its own and never serves one city's warehouses for another", async () => {
    const fetchStub = stubCityPages(
      new Map([
        [CITY_REF, MIXED_ROWS],
        [SECOND_CITY_REF, SECOND_CITY_ROWS],
      ])
    );
    const { GET } = await loadRoute();

    const first = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const second = await readItems(await GET(buildRequest(SECOND_CITY_PARAMS)));
    const rewarmed = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(first)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(second)).toEqual([SECOND_CITY_NUMBER]);
    expect(readLabels(second)).toEqual([SECOND_CITY_LABEL]);
    expect(readNumbers(second)).not.toContain(CAPTURED_NUMBER);
    expect(readNumbers(rewarmed)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(SEPARATE_CITY_MERGE_COUNT);
    expect(readEnvelope(fetchStub, 0)).toEqual(buildEnvelope(1));
    expect(readEnvelope(fetchStub, 1)).toEqual(
      buildEnvelope(1, SECOND_CITY_REF)
    );
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("keeps a merged city for twenty-four hours and re-merges the moment that day elapses", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    await GET(buildRequest(BRANCH_PARAMS));

    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + WAREHOUSE_CACHE_TTL_MS - 1);

    const warm = await GET(buildRequest(BRANCH_PARAMS));

    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + WAREHOUSE_CACHE_TTL_MS);

    const stale = await GET(buildRequest(BRANCH_PARAMS));

    expect(readNumbers(await readItems(warm))).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(await readItems(stale))).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(WAREHOUSE_TTL_MERGE_COUNT);
  });

  it("remembers one hundred and fifty cities and drops the least recent when the next arrives", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    for (let index = 0; index < CACHED_CITY_COUNT; index += 1) {
      const filled = await GET(buildAnonymousRequest(buildCityParams(index)));

      expect(filled.status).toBe(OK_STATUS);
    }

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_CITY_COUNT);

    await GET(buildAnonymousRequest(buildCityParams(RETAINED_CITY_INDEX)));

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_CITY_COUNT);

    await GET(buildAnonymousRequest(buildCityParams(EVICTED_CITY_INDEX)));

    expect(fetchStub).toHaveBeenCalledTimes(EVICTION_RELOAD_COUNT);
  });

  it("drops the rows np marks unusable and keeps the description verbatim", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(readLabels(items)).toEqual([CAPTURED_LABEL]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("denies a warehouse np marks unselectable as a number or a boolean, not only as a string", async () => {
    const fetchStub = stubPages([okPage(DENY_FLAVOUR_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([STRING_ALLOWED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("denies an unselectable warehouse whose flag carries surrounding whitespace", async () => {
    const fetchStub = stubPages([okPage(PADDED_DENY_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([PADDED_ALLOWED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("caps an overlong np warehouse number to sixty-four characters", async () => {
    const fetchStub = stubPages([okPage(OVERLONG_NUMBER_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPPED_NUMBER]);
    expect(readNumbers(items)[0]).toHaveLength(IDENTIFIER_CAP);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("caps an overlong np description so one bad row cannot pin the cache", async () => {
    const fetchStub = stubPages([okPage(OVERLONG_LABEL_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readLabels(items)).toEqual([CAPPED_LABEL]);
    expect(readLabels(items)[0]).toHaveLength(LABEL_CAP);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("shares one merge across the letter case of a city ref", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const lowercased = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const shouted = await readItems(
      await GET(buildRequest(SHOUTED_BRANCH_PARAMS))
    );

    expect(readNumbers(lowercased)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(shouted)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(buildEnvelope(1));
  });

  it("sends the lowercased city ref upstream when the shouted spelling arrives first", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const shouted = await readItems(
      await GET(buildRequest(SHOUTED_BRANCH_PARAMS))
    );
    const lowercased = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(shouted)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(lowercased)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(buildEnvelope(1));
  });

  it("keeps the two methods apart and answers a warm city without touching np", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const branches = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const postomats = await readItems(await GET(buildRequest(POSTOMAT_PARAMS)));
    const searched = await readItems(
      await GET(
        buildRequest({ ...POSTOMAT_PARAMS, [QUERY_PARAM]: POSTOMAT_NUMBER })
      )
    );

    expect(readNumbers(branches)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(postomats)).toEqual([POSTOMAT_NUMBER]);
    expect(readNumbers(searched)).toEqual([POSTOMAT_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("ranks number matches ahead of address matches and reads a number sign as no sign", async () => {
    const fetchStub = stubPages([okPage(RANKING_ROWS)]);
    const { GET } = await loadRoute();

    const signed = await readItems(
      await GET(
        buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: NUMBER_SIGN_QUERY })
      )
    );
    const bare = await readItems(
      await GET(buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: BARE_QUERY }))
    );

    expect(readNumbers(signed)).toEqual(RANKED_NUMBERS);
    expect(readNumbers(bare)).toEqual(RANKED_NUMBERS);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps an exact number match first when the prefix matches overflow the cap", async () => {
    const fetchStub = stubPages([okPage(CAP_OVERFLOW_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(
      await GET(
        buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: CAP_OVERFLOW_QUERY })
      )
    );

    expect(items).toHaveLength(ROW_LIMIT);
    expect(readNumbers(items)[0]).toBe(CAP_OVERFLOW_FIRST_NUMBER);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps only the warehouses whose address carries the query, in either case", async () => {
    const fetchStub = stubPages([okPage(ADDRESS_FILTER_ROWS)]);
    const { GET } = await loadRoute();

    const lowercased = await readItems(
      await GET(buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: STREET_QUERY }))
    );
    const shouted = await readItems(
      await GET(
        buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: SHOUTED_STREET_QUERY })
      )
    );

    expect(readNumbers(lowercased)).toEqual([STREET_NUMBER]);
    expect(readNumbers(shouted)).toEqual([STREET_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("browses the first thirty rows in upstream order when there is no query", async () => {
    const fetchStub = stubPages([okPage(DESCENDING_ROWS)]);
    const { GET } = await loadRoute();

    const blank = await readItems(
      await GET(buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: EMPTY_QUERY }))
    );
    const absent = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(blank).toHaveLength(ROW_LIMIT);
    expect(readNumbers(blank)).toEqual(
      buildDescendingNumbers(BULK_ROW_COUNT, ROW_LIMIT)
    );
    expect(readNumbers(absent)).toEqual(readNumbers(blank));
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("emits nothing but the number and label of every warehouse", async () => {
    stubPages([okPage(DESCENDING_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));
    const body = await response.text();
    const items = parseItems(body);

    expect(items).toHaveLength(ROW_LIMIT);

    for (const item of items) {
      expect(readItemKeys(item)).toEqual(ITEM_KEYS);
    }

    expectNoInternals(body);
  });

  it("answers 429 with a Retry-After header on the sixty-first request from one client", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const statuses: number[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      const allowed = await GET(buildRequest(BRANCH_PARAMS));

      statuses.push(allowed.status);
    }

    const blocked = await GET(buildRequest(BRANCH_PARAMS));
    const retryAfter = Number(blocked.headers.get(RETRY_AFTER_HEADER));

    expect(statuses).toEqual(Array(DIRECTORY_MAX_REQUESTS).fill(OK_STATUS));
    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);
    expect(retryAfter).toBeGreaterThanOrEqual(MIN_RETRY_AFTER_SECONDS);
    expect(retryAfter).toBeLessThanOrEqual(MAX_RETRY_AFTER_SECONDS);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("is declared dynamic so a build can never bake its answer", async () => {
    const { dynamic } = await loadRoute();

    expect(dynamic).toBe(FORCE_DYNAMIC);
  });
});
