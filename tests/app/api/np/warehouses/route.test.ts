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
const BRANCH_METHOD = "branch";
const POSTOMAT_METHOD = "postomat";
const UNKNOWN_METHOD = "garbage";
const MAX_CITY_REF_LENGTH = 64;
const BLANK_CITY = "   ";
const OVERLONG_CITY = "c".repeat(MAX_CITY_REF_LENGTH + 1);
const SEPARATOR_CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626|12";
const DAMPER_FAILURE_THRESHOLD = 3;

const FIRST_PAGE = "1";
const PAGE_LIMIT = 500;
const ROW_LIMIT = 30;
const FIND_BY_STRING_KEY = "FindByString";
const REQUEST_TIMEOUT_MS = 7000;
const CLIENT_DEFAULT_TIMEOUT_MS = 2500;

const WAREHOUSE_CACHE_TTL_MS = 300_000;
const WAREHOUSE_NEGATIVE_CACHE_TTL_MS = 30_000;
const CACHE_MAX_ENTRIES = 250;
const CACHED_QUERY_COUNT = CACHE_MAX_ENTRIES + 1;
const EVICTION_RELOAD_COUNT = CACHED_QUERY_COUNT + 1;
const EVICTED_QUERY_INDEX = 0;
const RETAINED_QUERY_INDEX = 1;
const INDEXED_QUERY_PREFIX = "q";
const TTL_RELOAD_COUNT = 2;
const NEGATIVE_TTL_RETRY_COUNT = 2;
const SHARED_PAGE_CALL_COUNT = 1;
const SEPARATE_QUERY_CALL_COUNT = 2;
const SEPARATE_CITY_CALL_COUNT = 2;
const EMPTY_ANSWER_RELOAD_COUNT = 2;
const CONCURRENT_REQUEST_COUNT = 2;

const OK_STATUS = 200;
const INVALID_REQUEST_STATUS = 400;
const TOO_MANY_REQUESTS_STATUS = 429;
const BAD_GATEWAY_STATUS = 502;
const UNAVAILABLE_STATUS = 503;

const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const INVALID_REQUEST_BODY = '{"error":"Invalid request"}';
const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';
const EMPTY_ITEMS_BODY = '{"items":[]}';

const DIRECTORY_MAX_REQUESTS = 60;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

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

const LABEL_CAP = 256;
const IDENTIFIER_CAP = 64;
const OVERLONG_LABEL_LENGTH = 900;
const OVERLONG_NUMBER_LENGTH = 300;
const TAB_CHAR_CODE = 9;
const NEWLINE_CHAR_CODE = 10;
const ZERO_WIDTH_SPACE_CODE = 8203;
const ZERO_WIDTH_SPACE = String.fromCharCode(ZERO_WIDTH_SPACE_CODE);

const EMPTY_TEXT = "";
const BULK_ROW_COUNT = 60;
const CAP_OVERFLOW_ROW_COUNT = 119;
const CROWDED_ROW_COUNT = 40;
const BRANCH_HEAVY_ROW_COUNT = 40;
const TRAILING_POSTOMAT_NUMBER = "9001";
const NUMERIC_NUMBER = 1;

const CAPTURED_NUMBER = "1";
const CAPTURED_LABEL = "Відділення №1: вул. Пирогівський шлях, 135";
const REPEATED_LABEL = "Відділення №1: вул. Інша, 7";
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
const OVERLONG_LABEL_NUMBER = "77";
const OVERLONG_LABEL = "в".repeat(OVERLONG_LABEL_LENGTH);
const CAPPED_LABEL = "в".repeat(LABEL_CAP);

const EXACT_NUMBER = "12";
const PREFIXED_NUMBER = "120";
const ADDRESS_NUMBER = "3";
const EXACT_LABEL = "Відділення №12: вул. Соборна, 5";
const PREFIXED_LABEL = "Відділення №120: вул. Миру, 1";
const ADDRESS_LABEL = "Відділення №3: вул. 12-го Квітня, 7";
const RANKED_NUMBERS = [EXACT_NUMBER, PREFIXED_NUMBER, ADDRESS_NUMBER];

const STREET_NUMBER = "41";
const OTHER_STREET_NUMBER = "42";
const FAR_STREET_NUMBER = "43";
const STREET_LABEL = "Відділення №41: вул. Хрещатик, 22";
const OTHER_STREET_LABEL = "Відділення №42: вул. Січових Стрільців, 8";
const FAR_STREET_LABEL = "Відділення №43: просп. Науки, 3";
const UNFILTERED_NUMBERS = [
  STREET_NUMBER,
  OTHER_STREET_NUMBER,
  FAR_STREET_NUMBER,
];

const SECOND_CITY_NUMBER = "301";
const SECOND_CITY_LABEL = "Відділення №301: вул. Соборності, 4";

const MAX_QUERY_LENGTH = 64;
const OVERLONG_QUERY_LENGTH = 300;
const NUMBER_SIGN = "№";
const BARE_QUERY = "12";
const SIGNED_QUERY = `${NUMBER_SIGN}${BARE_QUERY}`;
const SPACED_SIGNED_QUERY = `${NUMBER_SIGN} ${BARE_QUERY}`;
const DOUBLE_SIGNED_QUERY = `${NUMBER_SIGN}${SIGNED_QUERY}`;
const STREET_QUERY = "хрещатик";
const SHOUTED_STREET_QUERY = STREET_QUERY.toUpperCase();
const SPLIT_STREET_QUERY = `хре${ZERO_WIDTH_SPACE}щатик`;
const PADDED_STREET_QUERY = "  вул.   Хрещатик  ";
const COLLAPSED_STREET_QUERY = "вул. Хрещатик";
const OVERLONG_QUERY = "х".repeat(OVERLONG_QUERY_LENGTH);
const SLICED_QUERY = "х".repeat(MAX_QUERY_LENGTH);
const EMPTY_QUERY = "";
const BLANK_QUERY = "   ";
const CAP_OVERFLOW_QUERY = "1";
const CAP_OVERFLOW_FIRST_NUMBER = "1";
const CROWDED_QUERY = "вул";

const GATEWAY_TEXT = "np gateway error page";
const RATE_LIMITED_ENVELOPE = {
  success: false,
  data: [],
  errors: [],
  errorCodes: [],
};
const NON_ARRAY_DATA_ENVELOPE = { success: true, data: {} };
const NON_OBJECT_ROW = "не об'єкт";
const TIMEOUT_ERROR_NAME = "TimeoutError";
const TIMEOUT_ERROR_MESSAGE = "The operation was aborted due to timeout";
const NETWORK_ERROR_MESSAGE = "fetch failed";

interface WarehouseRow {
  Description?: string;
  Number: string;
  CategoryOfWarehouse: string;
  WarehouseStatus: string;
  DenyToSelect: string | number | boolean;
  TypeOfWarehouse: string;
}

interface NormalizationCase {
  raw: string;
  sent: string;
}

interface TimeoutRecorder {
  delays: number[];
  signals: AbortSignal[];
}

interface ResponseGate {
  respond: () => Promise<Response>;
  release: () => void;
}

const loadRoute = () => import("@root/app/api/np/warehouses/route");

const readText = (value: unknown): string =>
  typeof value === "string" ? value : EMPTY_TEXT;

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

const EMPTY_ROWS: readonly WarehouseRow[] = [];

const MIXED_ROWS: readonly WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER, { Description: CAPTURED_LABEL }),
  buildRow(POSTOMAT_NUMBER, { CategoryOfWarehouse: POSTOMAT_CATEGORY }),
  buildRow(DENIED_NUMBER, { DenyToSelect: DENIED_FLAG }),
  buildRow(CLOSED_NUMBER, { WarehouseStatus: CLOSED_STATUS }),
  buildRow(CARGO_NUMBER, { CategoryOfWarehouse: CARGO_CATEGORY }),
  buildRow(NAMELESS_NUMBER, { Description: undefined }),
];

const POLICY_REJECTED_ROWS: readonly WarehouseRow[] = [
  buildRow(POSTOMAT_NUMBER, { CategoryOfWarehouse: POSTOMAT_CATEGORY }),
  buildRow(DENIED_NUMBER, { DenyToSelect: DENIED_FLAG }),
  buildRow(CLOSED_NUMBER, { WarehouseStatus: CLOSED_STATUS }),
  buildRow(CARGO_NUMBER, { CategoryOfWarehouse: CARGO_CATEGORY }),
];

const BRANCH_HEAVY_ROWS: readonly WarehouseRow[] = [
  ...buildAscendingPage(BRANCH_HEAVY_ROW_COUNT, 1),
  buildRow(TRAILING_POSTOMAT_NUMBER, {
    CategoryOfWarehouse: POSTOMAT_CATEGORY,
  }),
];

const BOTH_METHODS_REJECTED_ROWS: readonly WarehouseRow[] = [
  buildRow(DENIED_NUMBER, { DenyToSelect: DENIED_FLAG }),
  buildRow(CLOSED_NUMBER, { WarehouseStatus: CLOSED_STATUS }),
  buildRow(CARGO_NUMBER, { CategoryOfWarehouse: CARGO_CATEGORY }),
];

const CROWDED_DENIED_ROWS: readonly WarehouseRow[] = buildAscendingPage(
  CROWDED_ROW_COUNT,
  1,
  { DenyToSelect: DENIED_FLAG }
);

const UNDECODABLE_ROWS: readonly unknown[] = [
  NON_OBJECT_ROW,
  { ...buildRow(CAPTURED_NUMBER), Number: NUMERIC_NUMBER },
  buildRow(POSTOMAT_NUMBER, { Description: EMPTY_TEXT }),
  { ...buildRow(DENIED_NUMBER), Number: EMPTY_TEXT },
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

const WORD_DENIED_NUMBER = "31";
const WORD_DENIED_FLAG = "true";
const RENAMED_CATEGORY = "Branch_v2";

const WORD_DENIED_ROWS: WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER),
  buildRow(WORD_DENIED_NUMBER, { DenyToSelect: WORD_DENIED_FLAG }),
];

const RENAMED_CATEGORY_ROWS: WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER, { CategoryOfWarehouse: RENAMED_CATEGORY }),
  buildRow(POSTOMAT_NUMBER, { CategoryOfWarehouse: RENAMED_CATEGORY }),
];

const CARGO_ONLY_ROWS: WarehouseRow[] = [
  buildRow(CARGO_NUMBER, { CategoryOfWarehouse: CARGO_CATEGORY }),
];

const POSTOMAT_QUERY_ROWS: WarehouseRow[] = [
  buildRow(EXACT_NUMBER, { CategoryOfWarehouse: POSTOMAT_CATEGORY }),
];

const SHARED_POSTOMAT_LABEL = "Поштомат №1: вул. Хрещатик, 22";

const SHARED_NUMBER_ROWS: WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER, { Description: CAPTURED_LABEL }),
  buildRow(CAPTURED_NUMBER, {
    CategoryOfWarehouse: POSTOMAT_CATEGORY,
    Description: SHARED_POSTOMAT_LABEL,
  }),
];

const LETTERED_NUMBER = "12A";
const LETTERED_QUERY = "12a";

const LETTERED_NUMBER_ROWS: WarehouseRow[] = [
  buildRow("77"),
  buildRow(LETTERED_NUMBER),
];

const DUPLICATE_NUMBER_ROWS: readonly WarehouseRow[] = [
  buildRow(CAPTURED_NUMBER, { Description: CAPTURED_LABEL }),
  buildRow(CAPTURED_NUMBER, { Description: REPEATED_LABEL }),
];

const OVERLONG_NUMBER_ROWS: readonly WarehouseRow[] = [
  buildRow(OVERLONG_NUMBER),
];

const OVERLONG_LABEL_ROWS: readonly WarehouseRow[] = [
  buildRow(OVERLONG_LABEL_NUMBER, { Description: OVERLONG_LABEL }),
];

const RANKING_ROWS: readonly WarehouseRow[] = [
  buildRow(ADDRESS_NUMBER, { Description: ADDRESS_LABEL }),
  buildRow(PREFIXED_NUMBER, { Description: PREFIXED_LABEL }),
  buildRow(EXACT_NUMBER, { Description: EXACT_LABEL }),
];

const ADDRESS_ROWS: readonly WarehouseRow[] = [
  buildRow(STREET_NUMBER, { Description: STREET_LABEL }),
  buildRow(OTHER_STREET_NUMBER, { Description: OTHER_STREET_LABEL }),
  buildRow(FAR_STREET_NUMBER, { Description: FAR_STREET_LABEL }),
];

const SECOND_CITY_ROWS: readonly WarehouseRow[] = [
  buildRow(SECOND_CITY_NUMBER, { Description: SECOND_CITY_LABEL }),
];

const DESCENDING_ROWS = buildDescendingPage(BULK_ROW_COUNT);
const CAP_OVERFLOW_ROWS = buildDescendingPage(CAP_OVERFLOW_ROW_COUNT);

const NORMALIZATION_CASES: readonly NormalizationCase[] = [
  { raw: SPLIT_STREET_QUERY, sent: STREET_QUERY },
  { raw: PADDED_STREET_QUERY, sent: COLLAPSED_STREET_QUERY },
  { raw: SPACED_SIGNED_QUERY, sent: BARE_QUERY },
  { raw: DOUBLE_SIGNED_QUERY, sent: SIGNED_QUERY },
  { raw: OVERLONG_QUERY, sent: SLICED_QUERY },
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

const OUT_OF_SHAPE_CITY_REFS: readonly string[] = [
  SEPARATOR_CITY_REF,
  "8d5a980d 391c 11dd 90d9 001a92567626",
  "8d5a980d-391c-11dd-90d9-00za92567626",
  "../../etc/passwd",
  "Київ",
];

const INVALID_PARAMS: readonly Record<string, string>[] = [
  { [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: BLANK_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: OVERLONG_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: CITY_REF },
  { [CITY_PARAM]: CITY_REF, [METHOD_PARAM]: UNKNOWN_METHOD },
  ...OUT_OF_SHAPE_CITY_REFS.map((city) => ({
    [CITY_PARAM]: city,
    [METHOD_PARAM]: BRANCH_METHOD,
  })),
];

const npResponse = (rows: readonly unknown[]): Response =>
  jsonResponse({ success: true, data: rows }, OK_STATUS);

const okRows =
  (rows: readonly unknown[]): FetchStub =>
  () =>
    Promise.resolve(npResponse(rows));

const NOT_OK_FAILURE: FetchStub = () =>
  Promise.resolve(new Response(null, { status: BAD_GATEWAY_STATUS }));

const SUCCESS_FALSE_FAILURE: FetchStub = () =>
  Promise.resolve(jsonResponse(RATE_LIMITED_ENVELOPE, OK_STATUS));

const NON_RECORD_FAILURE: FetchStub = () =>
  Promise.resolve(jsonResponse(GATEWAY_TEXT, OK_STATUS));

const NON_ARRAY_DATA_FAILURE: FetchStub = () =>
  Promise.resolve(jsonResponse(NON_ARRAY_DATA_ENVELOPE, OK_STATUS));

const TIMEOUT_FAILURE: FetchStub = () =>
  Promise.reject(new DOMException(TIMEOUT_ERROR_MESSAGE, TIMEOUT_ERROR_NAME));

const NETWORK_FAILURE: FetchStub = () =>
  Promise.reject(new TypeError(NETWORK_ERROR_MESSAGE));

const UPSTREAM_FAILURES: readonly FetchStub[] = [
  NOT_OK_FAILURE,
  SUCCESS_FALSE_FAILURE,
  NON_RECORD_FAILURE,
  NON_ARRAY_DATA_FAILURE,
  TIMEOUT_FAILURE,
  NETWORK_FAILURE,
];

const buildRequestUrl = (params: Record<string, string>): string =>
  `${ROUTE_URL}?${new URLSearchParams(params).toString()}`;

const buildRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(buildRequestUrl(params), {
    headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP },
  });

const buildAnonymousRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(buildRequestUrl(params));

const buildQueryParams = (query: string): Record<string, string> => ({
  ...BRANCH_PARAMS,
  [QUERY_PARAM]: query,
});

const buildIndexedQuery = (index: number): string =>
  `${INDEXED_QUERY_PREFIX}${index}`;

const buildMethodProperties = (
  cityRef: string = CITY_REF
): Record<string, string> => ({
  CityRef: cityRef,
  Page: FIRST_PAGE,
  Limit: String(PAGE_LIMIT),
});

const buildSearchProperties = (
  query: string,
  cityRef: string = CITY_REF
): Record<string, string> => ({
  ...buildMethodProperties(cityRef),
  [FIND_BY_STRING_KEY]: query,
});

const buildEnvelope = (methodProperties: Record<string, string>): unknown => ({
  apiKey: FAKE_API_KEY,
  modelName: NP_MODEL_NAME,
  calledMethod: NP_METHOD,
  methodProperties,
});

const stubSequence = (responders: readonly FetchStub[]): Mock<FetchStub> => {
  let callIndex = 0;

  return stubUpstream((input, init) => {
    const responder = responders[Math.min(callIndex, responders.length - 1)];

    callIndex += 1;

    return responder(input, init);
  });
};

const readBodyEnvelope = (init: RequestInit | undefined): unknown => {
  const body = init?.body;

  return typeof body === "string" ? JSON.parse(body) : null;
};

const readEnvelope = (fetchStub: Mock<FetchStub>, callIndex: number): unknown =>
  readBodyEnvelope(fetchStub.mock.calls[callIndex][1]);

const readMethodProperties = (
  fetchStub: Mock<FetchStub>,
  callIndex: number
): Record<string, unknown> => {
  const envelope = readEnvelope(fetchStub, callIndex);

  if (!isRecord(envelope) || !isRecord(envelope.methodProperties)) {
    return {};
  }

  return envelope.methodProperties;
};

const readFindByString = (
  fetchStub: Mock<FetchStub>,
  callIndex: number
): string =>
  readText(readMethodProperties(fetchStub, callIndex)[FIND_BY_STRING_KEY]);

const readRequestedCity = (init: RequestInit | undefined): string => {
  const envelope = readBodyEnvelope(init);

  if (!isRecord(envelope) || !isRecord(envelope.methodProperties)) {
    return EMPTY_TEXT;
  }

  return readText(envelope.methodProperties.CityRef);
};

const stubCityRows = (
  rowsByCity: ReadonlyMap<string, readonly unknown[]>
): Mock<FetchStub> =>
  stubUpstream((_input, init) =>
    Promise.resolve(
      npResponse(rowsByCity.get(readRequestedCity(init)) ?? EMPTY_ROWS)
    )
  );

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

const readSignal = (
  fetchStub: Mock<FetchStub>,
  callIndex: number
): AbortSignal | null | undefined => fetchStub.mock.calls[callIndex][1]?.signal;

const recordTimeoutSignals = (): TimeoutRecorder => {
  const recorder: TimeoutRecorder = { delays: [], signals: [] };
  const realTimeout = AbortSignal.timeout.bind(AbortSignal);

  vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    const signal = realTimeout(milliseconds);

    recorder.delays.push(milliseconds);
    recorder.signals.push(signal);

    return signal;
  });

  return recorder;
};

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

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
  items.map((item) => (isRecord(item) ? readText(item.number) : EMPTY_TEXT));

const readLabels = (items: readonly unknown[]): string[] =>
  items.map((item) => (isRecord(item) ? readText(item.label) : EMPTY_TEXT));

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
  it("is declared dynamic so a build can never bake its answer", async () => {
    const { dynamic } = await loadRoute();

    expect(dynamic).toBe(FORCE_DYNAMIC);
  });

  it("answers 400 without touching the network for every invalid city or method", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
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

  it("refuses an out-of-shape city ref with 400, never 503, and never lets it arm the damper", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const statuses: number[] = [];

    for (let attempt = 0; attempt < DAMPER_FAILURE_THRESHOLD; attempt += 1) {
      const response = await GET(
        buildRequest({
          [CITY_PARAM]: SEPARATOR_CITY_REF,
          [METHOD_PARAM]: BRANCH_METHOD,
        })
      );

      statuses.push(response.status);
    }

    expect(statuses).toEqual(
      Array(DAMPER_FAILURE_THRESHOLD).fill(INVALID_REQUEST_STATUS)
    );
    expect(statuses).not.toContain(UNAVAILABLE_STATUS);
    expect(fetchStub).not.toHaveBeenCalled();

    const served = await GET(buildRequest(BRANCH_PARAMS));

    expect(served.status).toBe(OK_STATUS);
    expect(readNumbers(await readItems(served))).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("answers 503 without touching the network when the api key is absent", async () => {
    vi.stubEnv(NP_API_KEY_NAME, undefined);

    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers one identical 503 for every other upstream failure flavour, from a bad status to a network throw", async () => {
    silenceErrorLog();

    const fetchStub = stubSequence(UPSTREAM_FAILURES);

    const statuses: number[] = [];
    const bodies: string[] = [];

    for (let index = 0; index < UPSTREAM_FAILURES.length; index += 1) {
      vi.resetModules();

      const { GET } = await loadRoute();
      const response = await GET(
        buildRequest(buildQueryParams(buildIndexedQuery(index)))
      );

      statuses.push(response.status);
      bodies.push(await response.text());
    }

    expect(statuses).toEqual(
      Array(UPSTREAM_FAILURES.length).fill(UNAVAILABLE_STATUS)
    );
    expect(bodies).toEqual(
      Array(UPSTREAM_FAILURES.length).fill(UNAVAILABLE_BODY)
    );
    expect(fetchStub).toHaveBeenCalledTimes(UPSTREAM_FAILURES.length);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when np reports success false at http 200, the shape its own rate limit takes", async () => {
    const fetchStub = stubSequence([SUCCESS_FALSE_FAILURE]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoInternals(body);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when np sends rows it can structurally decode none of", async () => {
    const fetchStub = stubSequence([okRows(UNDECODABLE_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoInternals(body);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("answers 200 with an empty list when policy strikes out every structurally sound row", async () => {
    const fetchStub = stubSequence([okRows(POLICY_REJECTED_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("never answers 503 when a query matches many rows of which none is selectable", async () => {
    const fetchStub = stubSequence([okRows(CROWDED_DENIED_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(buildQueryParams(CROWDED_QUERY)));

    expect(response.status).not.toBe(UNAVAILABLE_STATUS);
    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("answers 200 with an empty list when np finds no warehouse at all", async () => {
    const fetchStub = stubSequence([okRows(EMPTY_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps no cache entry for a page that is empty for both methods so the next request asks np again", async () => {
    const fetchStub = stubSequence([
      okRows(BOTH_METHODS_REJECTED_ROWS),
      okRows(MIXED_ROWS),
    ]);
    const { GET } = await loadRoute();

    const empty = await GET(buildRequest(BRANCH_PARAMS));
    const refilled = await GET(buildRequest(BRANCH_PARAMS));

    expect(empty.status).toBe(OK_STATUS);
    expect(await readItems(empty)).toEqual([]);
    expect(readNumbers(await readItems(refilled))).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(EMPTY_ANSWER_RELOAD_COUNT);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 and remembers the failure for thirty seconds before it asks np again", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    const fetchStub = stubSequence([NOT_OK_FAILURE, okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const failed = await GET(buildRequest(BRANCH_PARAMS));

    expect(failed.status).toBe(UNAVAILABLE_STATUS);
    expect(await failed.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + WAREHOUSE_NEGATIVE_CACHE_TTL_MS - 1);

    const remembered = await GET(buildRequest(BRANCH_PARAMS));

    expect(remembered.status).toBe(UNAVAILABLE_STATUS);
    expect(await remembered.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + WAREHOUSE_NEGATIVE_CACHE_TTL_MS);

    const retried = await GET(buildRequest(BRANCH_PARAMS));

    expect(retried.status).toBe(OK_STATUS);
    expect(readNumbers(await readItems(retried))).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(NEGATIVE_TTL_RETRY_COUNT);
  });

  it("asks np for one capped page of the city and sends no FindByString at all when the query is empty", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const absent = await GET(buildRequest(BRANCH_PARAMS));
    const blank = await GET(buildRequest(buildQueryParams(BLANK_QUERY)));

    expect(absent.status).toBe(OK_STATUS);
    expect(blank.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(
      buildEnvelope(buildMethodProperties())
    );
    expect(readMethodProperties(fetchStub, 0)).not.toHaveProperty(
      FIND_BY_STRING_KEY
    );
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("delegates the substring search to np by sending the normalized query as FindByString", async () => {
    const fetchStub = stubSequence([okRows(ADDRESS_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(buildQueryParams(STREET_QUERY)));

    expect(response.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(
      buildEnvelope(buildSearchProperties(STREET_QUERY))
    );
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("hands fetch its own seven second signal so the client's two and a half second default is never inherited again", async () => {
    const recorder = recordTimeoutSignals();

    let abortedOnEntry = true;

    const fetchStub = stubUpstream((_input, init) => {
      abortedOnEntry = init?.signal?.aborted ?? true;

      return Promise.resolve(npResponse(MIXED_ROWS));
    });
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));
    const signal = readSignal(fetchStub, 0);

    expect(response.status).toBe(OK_STATUS);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(abortedOnEntry).toBe(false);
    expect(recorder.delays).toEqual([REQUEST_TIMEOUT_MS]);
    expect(recorder.delays).not.toContain(CLIENT_DEFAULT_TIMEOUT_MS);
    expect(signal).toBe(recorder.signals[0]);
  });

  it("normalizes the query before it reaches np without ever touching its letter case", async () => {
    const fetchStub = stubSequence([okRows(ADDRESS_ROWS)]);
    const { GET } = await loadRoute();

    const sent: string[] = [];

    for (const [index, testCase] of NORMALIZATION_CASES.entries()) {
      const response = await GET(buildRequest(buildQueryParams(testCase.raw)));

      expect(response.status).toBe(OK_STATUS);
      sent.push(readFindByString(fetchStub, index));
    }

    expect(sent).toEqual(NORMALIZATION_CASES.map((testCase) => testCase.sent));
    expect(fetchStub).toHaveBeenCalledTimes(NORMALIZATION_CASES.length);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("sends a shouted query upstream shouted and keeps it apart from its lowercase spelling", async () => {
    const fetchStub = stubSequence([okRows(ADDRESS_ROWS)]);
    const { GET } = await loadRoute();

    await GET(buildRequest(buildQueryParams(SHOUTED_STREET_QUERY)));
    await GET(buildRequest(buildQueryParams(STREET_QUERY)));

    expect(readFindByString(fetchStub, 0)).toBe(SHOUTED_STREET_QUERY);
    expect(readFindByString(fetchStub, 1)).toBe(STREET_QUERY);
    expect(fetchStub).toHaveBeenCalledTimes(SEPARATE_QUERY_CALL_COUNT);
  });

  it("ranks an exact number match first, then the number prefixes, then whatever np sent", async () => {
    const fetchStub = stubSequence([okRows(RANKING_ROWS)]);
    const { GET } = await loadRoute();

    const signed = await readItems(
      await GET(buildRequest(buildQueryParams(SIGNED_QUERY)))
    );
    const bare = await readItems(
      await GET(buildRequest(buildQueryParams(BARE_QUERY)))
    );

    expect(readNumbers(signed)).toEqual(RANKED_NUMBERS);
    expect(readNumbers(bare)).toEqual(RANKED_NUMBERS);
    expect(readFindByString(fetchStub, 0)).toBe(BARE_QUERY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps a warehouse whose address does not carry the query because np already did the matching", async () => {
    const fetchStub = stubSequence([okRows(ADDRESS_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(
      await GET(buildRequest(buildQueryParams(STREET_QUERY)))
    );

    expect(readNumbers(items)).toEqual(UNFILTERED_NUMBERS);
    expect(readLabels(items)).toContain(OTHER_STREET_LABEL);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("browses the first thirty rows in upstream order when there is no query", async () => {
    const fetchStub = stubSequence([okRows(DESCENDING_ROWS)]);
    const { GET } = await loadRoute();

    const blank = await readItems(
      await GET(buildRequest(buildQueryParams(EMPTY_QUERY)))
    );
    const absent = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(blank).toHaveLength(ROW_LIMIT);
    expect(readNumbers(blank)).toEqual(
      buildDescendingNumbers(BULK_ROW_COUNT, ROW_LIMIT)
    );
    expect(readNumbers(absent)).toEqual(readNumbers(blank));
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps an exact number match first when the prefix matches overflow the cap", async () => {
    const fetchStub = stubSequence([okRows(CAP_OVERFLOW_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(
      await GET(buildRequest(buildQueryParams(CAP_OVERFLOW_QUERY)))
    );

    expect(items).toHaveLength(ROW_LIMIT);
    expect(readNumbers(items)[0]).toBe(CAP_OVERFLOW_FIRST_NUMBER);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("drops the rows np marks unusable and keeps the description verbatim", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(readLabels(items)).toEqual([CAPTURED_LABEL]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("denies a warehouse np marks unselectable as a number or a boolean, not only as a string", async () => {
    const fetchStub = stubSequence([okRows(DENY_FLAVOUR_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([STRING_ALLOWED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("denies an unselectable warehouse whose flag carries surrounding whitespace", async () => {
    const fetchStub = stubSequence([okRows(PADDED_DENY_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([PADDED_ALLOWED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps the first of two warehouses np sends under one number", async () => {
    const fetchStub = stubSequence([okRows(DUPLICATE_NUMBER_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(readLabels(items)).toEqual([CAPTURED_LABEL]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("denies a warehouse np marks unselectable with the word true, the spelling a carrier that swaps encodings would send", async () => {
    const fetchStub = stubSequence([okRows(WORD_DENIED_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("serves an empty list rather than an outage when it recognises no category on the page, because an unlisted category is a fact about the settlement", async () => {
    const fetchStub = stubSequence([okRows(RENAMED_CATEGORY_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("still answers 200 with an empty list when every row carries a category np really has but we do not offer", async () => {
    const fetchStub = stubSequence([okRows(CARGO_ONLY_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("asks np for the locker category alongside a real query, the pair a shopper hunting a locker number sends", async () => {
    const fetchStub = stubSequence([okRows(POSTOMAT_QUERY_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(
      await GET(buildRequest({ ...POSTOMAT_PARAMS, [QUERY_PARAM]: BARE_QUERY }))
    );

    expect(readMethodProperties(fetchStub, 0)).toEqual({
      CityRef: CITY_REF,
      Page: FIRST_PAGE,
      Limit: String(PAGE_LIMIT),
      [FIND_BY_STRING_KEY]: BARE_QUERY,
    });
    expect(readNumbers(items)).toEqual([EXACT_NUMBER]);
  });

  it("keeps a branch and a locker that share one number, because np numbers the two categories apart", async () => {
    const fetchStub = stubSequence([okRows(SHARED_NUMBER_ROWS)]);
    const { GET } = await loadRoute();

    const branches = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const postomats = await readItems(await GET(buildRequest(POSTOMAT_PARAMS)));

    expect(readNumbers(branches)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(postomats)).toEqual([CAPTURED_NUMBER]);
    expect(readLabels(postomats)).toEqual([SHARED_POSTOMAT_LABEL]);
    expect(fetchStub).toHaveBeenCalledTimes(SHARED_PAGE_CALL_COUNT);
  });

  it("ranks a number match without regard to the letter case np spelled it in", async () => {
    const fetchStub = stubSequence([okRows(LETTERED_NUMBER_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(
      await GET(buildRequest(buildQueryParams(LETTERED_QUERY)))
    );

    expect(readNumbers(items)[0]).toBe(LETTERED_NUMBER);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("caps an overlong np warehouse number to sixty-four characters", async () => {
    const fetchStub = stubSequence([okRows(OVERLONG_NUMBER_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPPED_NUMBER]);
    expect(readNumbers(items)[0]).toHaveLength(IDENTIFIER_CAP);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("caps an overlong np description so one bad row cannot pin the cache", async () => {
    const fetchStub = stubSequence([okRows(OVERLONG_LABEL_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readLabels(items)).toEqual([CAPPED_LABEL]);
    expect(readLabels(items)[0]).toHaveLength(LABEL_CAP);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("emits nothing but the number and label of every warehouse", async () => {
    stubSequence([okRows(DESCENDING_ROWS)]);

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

  it("asks np once for both methods and never serves a postomat as a branch", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const branches = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const postomats = await readItems(await GET(buildRequest(POSTOMAT_PARAMS)));

    expect(readNumbers(branches)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(postomats)).toEqual([POSTOMAT_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(SHARED_PAGE_CALL_COUNT);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("carries no method in the upstream body, which is why one page serves both chips", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    await GET(buildRequest({ ...BRANCH_PARAMS, [QUERY_PARAM]: BARE_QUERY }));
    await GET(buildRequest({ ...POSTOMAT_PARAMS, [QUERY_PARAM]: BARE_QUERY }));

    expect(fetchStub).toHaveBeenCalledTimes(SHARED_PAGE_CALL_COUNT);
    expect(readMethodProperties(fetchStub, 0)).toEqual({
      CityRef: CITY_REF,
      Page: FIRST_PAGE,
      Limit: String(PAGE_LIMIT),
      [FIND_BY_STRING_KEY]: BARE_QUERY,
    });
  });

  it("serves the branch its empty answer from the page it already holds for the lockers", async () => {
    const fetchStub = stubSequence([okRows(POLICY_REJECTED_ROWS)]);
    const { GET } = await loadRoute();

    const branches = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const postomats = await readItems(await GET(buildRequest(POSTOMAT_PARAMS)));

    expect(branches).toEqual([]);
    expect(readNumbers(postomats)).toEqual([POSTOMAT_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(SHARED_PAGE_CALL_COUNT);
  });

  it("caps each method after the split, so a page whose first rows are all branches still yields its lockers", async () => {
    const fetchStub = stubSequence([okRows(BRANCH_HEAVY_ROWS)]);
    const { GET } = await loadRoute();

    const branches = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const postomats = await readItems(await GET(buildRequest(POSTOMAT_PARAMS)));

    expect(branches).toHaveLength(ROW_LIMIT);
    expect(readNumbers(postomats)).toEqual([TRAILING_POSTOMAT_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(SHARED_PAGE_CALL_COUNT);
  });

  it("serves a repeated city and query pair from the cache and asks np again for a new query", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const first = await GET(buildRequest(BRANCH_PARAMS));
    const repeated = await GET(buildRequest(BRANCH_PARAMS));

    expect(await first.text()).toBe(await repeated.text());
    expect(fetchStub).toHaveBeenCalledTimes(1);

    const searched = await GET(buildRequest(buildQueryParams(BARE_QUERY)));

    expect(searched.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(SEPARATE_QUERY_CALL_COUNT);
  });

  it("collapses two concurrent requests for one city and query pair into a single upstream call", async () => {
    const gate = createResponseGate(MIXED_ROWS);
    const fetchStub = stubUpstream(gate.respond);
    const { GET } = await loadRoute();

    const pending = [
      GET(buildRequest(BRANCH_PARAMS)),
      GET(buildRequest(BRANCH_PARAMS)),
    ];

    gate.release();

    const responses = await Promise.all(pending);
    const numbers = await Promise.all(
      responses.map(async (response) => readNumbers(await readItems(response)))
    );

    expect(responses).toHaveLength(CONCURRENT_REQUEST_COUNT);
    expect(numbers).toEqual(
      Array(CONCURRENT_REQUEST_COUNT).fill([CAPTURED_NUMBER])
    );
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("shares one answer across the letter case of a city ref", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const lowercased = await readItems(await GET(buildRequest(BRANCH_PARAMS)));
    const shouted = await readItems(
      await GET(buildRequest(SHOUTED_BRANCH_PARAMS))
    );

    expect(readNumbers(lowercased)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(shouted)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(
      buildEnvelope(buildMethodProperties())
    );
  });

  it("sends the lowercased city ref upstream when the shouted spelling arrives first", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const shouted = await readItems(
      await GET(buildRequest(SHOUTED_BRANCH_PARAMS))
    );
    const lowercased = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(shouted)).toEqual([CAPTURED_NUMBER]);
    expect(readNumbers(lowercased)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readEnvelope(fetchStub, 0)).toEqual(
      buildEnvelope(buildMethodProperties())
    );
  });

  it("asks np for every city on its own and never serves one city's warehouses for another", async () => {
    const fetchStub = stubCityRows(
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
    expect(readNumbers(rewarmed)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(SEPARATE_CITY_CALL_COUNT);
    expect(readEnvelope(fetchStub, 1)).toEqual(
      buildEnvelope(buildMethodProperties(SECOND_CITY_REF))
    );
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("keeps an answer for five minutes and asks np again the moment they elapse", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
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
    expect(fetchStub).toHaveBeenCalledTimes(TTL_RELOAD_COUNT);
  });

  it("remembers two hundred fifty city and query pairs and drops the least recent when the next arrives", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    for (let index = 0; index < CACHED_QUERY_COUNT; index += 1) {
      const filled = await GET(
        buildAnonymousRequest(buildQueryParams(buildIndexedQuery(index)))
      );

      expect(filled.status).toBe(OK_STATUS);
    }

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_QUERY_COUNT);

    await GET(
      buildAnonymousRequest(
        buildQueryParams(buildIndexedQuery(RETAINED_QUERY_INDEX))
      )
    );

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_QUERY_COUNT);

    await GET(
      buildAnonymousRequest(
        buildQueryParams(buildIndexedQuery(EVICTED_QUERY_INDEX))
      )
    );

    expect(fetchStub).toHaveBeenCalledTimes(EVICTION_RELOAD_COUNT);
  });

  it("answers 429 with a Retry-After header on the sixty-first request from one client", async () => {
    const fetchStub = stubSequence([okRows(MIXED_ROWS)]);
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
});
