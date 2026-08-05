import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { NextRequest } from "next/server";

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
const LAST_PAGE_ROW_COUNT = 3;
const DIRECTORY_MAX_REQUESTS = 60;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;

const OK_STATUS = 200;
const INVALID_REQUEST_STATUS = 400;
const TOO_MANY_REQUESTS_STATUS = 429;
const BAD_GATEWAY_STATUS = 502;
const UNAVAILABLE_STATUS = 503;

const JSON_HEADERS = { "Content-Type": "application/json" };

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
const TYPE_OF_WAREHOUSE_REF = "9a68df70-0267-42a8-bb5c-37f427e36ee4";

const CAPTURED_NUMBER = "1";
const CAPTURED_LABEL = "Відділення №1: вул. Пирогівський шлях, 135";
const POSTOMAT_NUMBER = "2";
const DENIED_NUMBER = "3";
const CLOSED_NUMBER = "4";
const CARGO_NUMBER = "5";
const NAMELESS_NUMBER = "6";

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
  DenyToSelect: string;
  TypeOfWarehouse: string;
}

type FetchStub = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

type PageResponder = () => Response;

const loadRoute = () => import("@root/app/api/np/warehouses/route");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

const FIRST_PAGE_ROWS = buildAscendingPage(PAGE_SIZE, 1);
const LAST_PAGE_ROWS = buildAscendingPage(LAST_PAGE_ROW_COUNT, PAGE_SIZE + 1, {
  CategoryOfWarehouse: POSTOMAT_CATEGORY,
});
const LAST_PAGE_NUMBERS = LAST_PAGE_ROWS.map((row) => row.Number);
const DESCENDING_ROWS = buildDescendingPage(BULK_ROW_COUNT);

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

const BRANCH_PARAMS = {
  [CITY_PARAM]: CITY_REF,
  [METHOD_PARAM]: BRANCH_METHOD,
};
const POSTOMAT_PARAMS = {
  [CITY_PARAM]: CITY_REF,
  [METHOD_PARAM]: POSTOMAT_METHOD,
};

const INVALID_PARAMS: readonly Record<string, string>[] = [
  { [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: BLANK_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: OVERLONG_CITY, [METHOD_PARAM]: BRANCH_METHOD },
  { [CITY_PARAM]: CITY_REF },
  { [CITY_PARAM]: CITY_REF, [METHOD_PARAM]: UNKNOWN_METHOD },
];

const buildRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(`${ROUTE_URL}?${new URLSearchParams(params).toString()}`, {
    headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP },
  });

const npResponse = (rows: readonly unknown[]): Response =>
  new Response(JSON.stringify({ success: true, data: rows }), {
    status: OK_STATUS,
    headers: JSON_HEADERS,
  });

const okPage =
  (rows: readonly unknown[]): PageResponder =>
  () =>
    npResponse(rows);

const failedPage = (): PageResponder => () =>
  new Response(null, { status: BAD_GATEWAY_STATUS });

const stubPages = (responders: readonly PageResponder[]): Mock<FetchStub> => {
  let callIndex = 0;

  const fetchStub = vi.fn<FetchStub>(() => {
    const responder = responders[Math.min(callIndex, responders.length - 1)];

    callIndex += 1;

    return Promise.resolve(responder());
  });

  vi.stubGlobal("fetch", fetchStub);

  return fetchStub;
};

const expectUpstreamOnly = (calls: readonly Parameters<FetchStub>[]): void => {
  for (const [input] of calls) {
    expect(input).toBe(NP_API_URL);
  }
};

const readEnvelope = (
  fetchStub: Mock<FetchStub>,
  callIndex: number
): unknown => {
  const body = fetchStub.mock.calls[callIndex][1]?.body;

  return typeof body === "string" ? JSON.parse(body) : null;
};

const buildEnvelope = (page: number): unknown => ({
  apiKey: FAKE_API_KEY,
  modelName: NP_MODEL_NAME,
  calledMethod: NP_METHOD,
  methodProperties: {
    CityRef: CITY_REF,
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

  it("answers 503 and caches nothing when a page of the merge fails", async () => {
    const fetchStub = stubPages([
      okPage(FIRST_PAGE_ROWS),
      failedPage(),
      okPage(MIXED_ROWS),
    ]);
    const { GET } = await loadRoute();

    const failed = await GET(buildRequest(BRANCH_PARAMS));
    const retried = await GET(buildRequest(BRANCH_PARAMS));
    const items = await readItems(retried);

    expect(failed.status).toBe(UNAVAILABLE_STATUS);
    expect(await failed.text()).toBe(UNAVAILABLE_BODY);
    expect(retried.status).toBe(OK_STATUS);
    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(fetchStub).toHaveBeenCalledTimes(3);
    expect(readEnvelope(fetchStub, 2)).toEqual(buildEnvelope(1));
    expectUpstreamOnly(fetchStub.mock.calls);
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
    expectUpstreamOnly(fetchStub.mock.calls);
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
    expectUpstreamOnly(fetchStub.mock.calls);
  });

  it("merges the pages of one city under a single deadline and stops at the short page", async () => {
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
    expectUpstreamOnly(fetchStub.mock.calls);
  });

  it("stops at the page cap and serves the truncated list as a normal answer", async () => {
    const fetchStub = stubPages([okPage(FIRST_PAGE_ROWS)]);
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BRANCH_PARAMS));
    const items = await readItems(response);

    expect(response.status).toBe(OK_STATUS);
    expect(items).toHaveLength(ROW_LIMIT);
    expect(fetchStub).toHaveBeenCalledTimes(MAX_PAGES);
    expect(readEnvelope(fetchStub, MAX_PAGES - 1)).toEqual(
      buildEnvelope(MAX_PAGES)
    );
    expectUpstreamOnly(fetchStub.mock.calls);
  });

  it("drops the rows np marks unusable and keeps the description verbatim", async () => {
    const fetchStub = stubPages([okPage(MIXED_ROWS)]);
    const { GET } = await loadRoute();

    const items = await readItems(await GET(buildRequest(BRANCH_PARAMS)));

    expect(readNumbers(items)).toEqual([CAPTURED_NUMBER]);
    expect(readLabels(items)).toEqual([CAPTURED_LABEL]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls);
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
    expectUpstreamOnly(fetchStub.mock.calls);
  });

  it("is declared dynamic so a build can never bake its answer", async () => {
    const { dynamic } = await loadRoute();

    expect(dynamic).toBe(FORCE_DYNAMIC);
  });
});
