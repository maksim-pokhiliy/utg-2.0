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

const ROUTE_URL = "https://example.test/api/np/settlements";
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_HOST = "novaposhta";
const NP_MODEL_NAME = "Address";
const SETTLEMENTS_METHOD = "searchSettlements";

const NP_API_KEY_NAME = "NOVA_POSHTA_API_KEY";
const FAKE_API_KEY = "np-test-key";

const CLIENT_IP = "203.0.113.7";
const FORWARDED_FOR_HEADER = "x-forwarded-for";
const QUERY_PARAM = "q";
const RETRY_AFTER_HEADER = "Retry-After";
const CONTENT_TYPE_HEADER = "Content-Type";
const JSON_CONTENT_TYPE = "application/json";
const JSON_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };

const OK_STATUS = 200;
const BAD_GATEWAY_STATUS = 502;
const TOO_MANY_REQUESTS_STATUS = 429;
const UNAVAILABLE_STATUS = 503;

const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';
const EMPTY_ITEMS_BODY = '{"items":[]}';

const DIRECTORY_MAX_REQUESTS = 60;
const MIN_RETRY_AFTER_SECONDS = 1;
const MAX_RETRY_AFTER_SECONDS = 60;
const REPEATED_REQUEST_COUNT = 3;

const SETTLEMENT_CACHE_TTL_MS = 300_000;
const SETTLEMENT_TTL_RELOAD_COUNT = 2;
const CACHE_MAX_ENTRIES = 2000;
const CACHED_QUERY_COUNT = CACHE_MAX_ENTRIES + 1;
const EVICTION_RELOAD_COUNT = CACHED_QUERY_COUNT + 1;
const EVICTED_QUERY_INDEX = 0;
const RETAINED_QUERY_INDEX = 1;
const INDEXED_QUERY_PREFIX = "q";

const SETTLEMENT_ROW_LIMIT = 10;
const OVERSIZED_ROW_COUNT = 15;
const FIRST_PAGE = "1";
const PRESENT_SEPARATOR = ", ";
const EMPTY_TEXT = "";

const UNKNOWN_WAREHOUSE_COUNT = null;
const ALLOWED_COURIER = true;
const DENIED_COURIER = false;
const FAIL_OPEN_COURIER = true;
const ABSENT_DELIVERY_FACTS = {
  warehouseCount: UNKNOWN_WAREHOUSE_COUNT,
  isCourierAllowed: FAIL_OPEN_COURIER,
};

const CAPTURED_KYIV_WAREHOUSES = 6231;
const CAPTURED_KYIVETS_WAREHOUSES = 2;
const ZERO_WAREHOUSES = 0;
const ZERO_WAREHOUSE_TEXT = "0";
const PROBED_WAREHOUSE_TEXT = "12";
const PROBED_WAREHOUSE_COUNT = 12;
const PADDED_WAREHOUSE_TEXT = " 7 ";
const PADDED_WAREHOUSE_COUNT = 7;
const NEGATIVE_WAREHOUSES = -4;
const NEGATIVE_WAREHOUSE_TEXT = "-4";
const FRACTIONAL_WAREHOUSE_TEXT = "12.5";
const FRACTIONAL_WAREHOUSES = 12.5;
const GARBAGE_WAREHOUSE_TEXT = "багато";
const OVERFLOWING_JSON_NUMBER = "1e400";
const RAW_NUMBER_PLACEHOLDER = "__raw_number__";

const ALLOWED_COURIER_TEXT = "1";
const DENIED_COURIER_TEXT = "0";
const PADDED_ALLOWED_COURIER_TEXT = " 1 ";
const PADDED_DENIED_COURIER_TEXT = " 0 ";
const ALLOWED_COURIER_CODE = 1;
const DENIED_COURIER_CODE = 0;
const STRAY_COURIER_CODE = 7;
const GARBAGE_COURIER_TEXT = "можливо";
const FALSE_COURIER_TEXT = "false";
const TRUE_COURIER_TEXT = "true";

const MAX_QUERY_LENGTH = 64;
const OVERLONG_QUERY_LENGTH = 300;
const OVERLONG_QUERY = "к".repeat(OVERLONG_QUERY_LENGTH);
const SLICED_QUERY = "к".repeat(MAX_QUERY_LENGTH);

const LABEL_CAP = 256;
const OVERLONG_LABEL_LENGTH = 900;
const OVERLONG_LABEL = "п".repeat(OVERLONG_LABEL_LENGTH);
const CAPPED_LABEL = "п".repeat(LABEL_CAP);

const IDENTIFIER_CAP = 64;
const OVERLONG_REF_LENGTH = 300;
const OVERLONG_REF = "d".repeat(OVERLONG_REF_LENGTH);
const CAPPED_REF = "d".repeat(IDENTIFIER_CAP);

const ZERO_WIDTH_SPACE_CODE = 8203;
const SOFT_HYPHEN_CODE = 173;
const BYTE_ORDER_MARK_CODE = 65_279;
const ZERO_WIDTH_SPACE = String.fromCharCode(ZERO_WIDTH_SPACE_CODE);
const SOFT_HYPHEN = String.fromCharCode(SOFT_HYPHEN_CODE);
const BYTE_ORDER_MARK = String.fromCharCode(BYTE_ORDER_MARK_CODE);
const INVISIBLE_QUERY = `${ZERO_WIDTH_SPACE}${SOFT_HYPHEN}${BYTE_ORDER_MARK}${ZERO_WIDTH_SPACE}`;
const SPLIT_KYIV_QUERY = `ки${ZERO_WIDTH_SPACE}їв`;

const DYNAMIC_MODE = "force-dynamic";

const KYIV_QUERY = "київ";
const PADDED_KYIV_QUERY = "  КИЇВ   ";
const NORMALIZED_KYIV_QUERY = "київ";
const LVIV_QUERY = "льв";
const BLANK_QUERY = "   ";
const SHORT_QUERY = "л";
const FIRST_NESTING_QUERY = "оде";
const SECOND_NESTING_QUERY = "хар";
const THIRD_NESTING_QUERY = "дні";
const OVERSIZED_QUERY = "сел";
const MIXED_QUERY = "змі";
const DROPPED_QUERY = "смі";
const FALLBACK_QUERY = "дуб";
const EMPTY_DATA_QUERY = "пор";
const OVERLONG_LABEL_QUERY = "дов";
const OVERLONG_REF_QUERY = "реф";
const UNDECODABLE_QUERY = "нез";
const PROBED_ENCODING_QUERY = "жив";
const WAREHOUSE_COUNT_QUERY = "скл";
const COURIER_QUERY = "кур";
const OVERFLOWING_COUNT_QUERY = "неск";
const HEADLESS_PRESENT_QUERY = "без";
const UNNAMED_ROW_QUERY = "ано";

const ARABIC_LETTER_MARK_CODE = 1564;
const FIRST_STRONG_ISOLATE_CODE = 8296;
const POP_DIRECTIONAL_ISOLATE_CODE = 8297;
const ARABIC_LETTER_MARK = String.fromCharCode(ARABIC_LETTER_MARK_CODE);
const FIRST_STRONG_ISOLATE = String.fromCharCode(FIRST_STRONG_ISOLATE_CODE);
const POP_DIRECTIONAL_ISOLATE = String.fromCharCode(
  POP_DIRECTIONAL_ISOLATE_CODE
);
const BIDI_INVISIBLE_QUERY = `${ARABIC_LETTER_MARK}${FIRST_STRONG_ISOLATE}${POP_DIRECTIONAL_ISOLATE}`;
const ISOLATED_KYIV_QUERY = `${FIRST_STRONG_ISOLATE}${KYIV_QUERY}${POP_DIRECTIONAL_ISOLATE}`;

const MALFORMED_BODY = "np gateway error page";
const BROKEN_ADDRESSES = "Addresses came back as text";
const NON_OBJECT_ADDRESS = "не об'єкт";

const TIMEOUT_ERROR_NAME = "TimeoutError";
const TIMEOUT_ERROR_MESSAGE = "The operation was aborted due to timeout";

const KYIV_DELIVERY_CITY = "8d5a980d-391c-11dd-90d9-001a92567626";
const KYIV_SETTLEMENT_REF = "e718a680-4b33-11e4-ab6d-005056801329";
const KYIVETS_DELIVERY_CITY = "6dbe5985-96d1-11ea-a970-b8830365ade4";
const KYIVETS_SETTLEMENT_REF = "0df25497-4b3a-11e4-ab6d-005056801329";
const CHERNIHIV_DELIVERY_CITY = "db5c88f5-391c-11dd-90d9-001a92567626";
const DUBOVE_DELIVERY_CITY = "db5c88e0-391c-11dd-90d9-001a92567626";
const TYSA_DELIVERY_CITY = "db5c88c0-391c-11dd-90d9-001a92567626";
const SUMY_DELIVERY_CITY = "db5c88b1-391c-11dd-90d9-001a92567626";

const KYIV_PRESENT = "м. Київ, Київська обл.";
const KYIV_LABEL = "м. Київ";
const KYIV_REGION = "Київська обл.";

const KYIVETS_PRESENT = "с. Київець, Миколаївський р-н, Львівська обл.";
const KYIVETS_LABEL = "с. Київець";
const KYIVETS_REGION = "Миколаївський р-н, Львівська обл.";

const KYIV_MAIN_DESCRIPTION = "Київ";
const KYIV_AREA = "Київська";
const HEADLESS_PRESENT = `${PRESENT_SEPARATOR}${KYIV_REGION}`;

const CHERNIHIV_PRESENT = "Чернігів";
const CHERNIHIV_MAIN_DESCRIPTION = "Чернігів";
const CHERNIHIV_AREA = "Чернігівська";
const DUBOVE_MAIN_DESCRIPTION = "Дубове";
const DUBOVE_AREA = "Закарпатська";
const TYSA_MAIN_DESCRIPTION = "Тиса";
const OVERLONG_DELIVERY_CITY = "db5c88d0-391c-11dd-90d9-001a92567626";

const REF_KEY = "ref";
const LABEL_KEY = "label";
const REGION_KEY = "region";
const WAREHOUSE_COUNT_KEY = "warehouseCount";
const COURIER_KEY = "isCourierAllowed";
const REGIONLESS_ITEM_KEYS: readonly string[] = [
  COURIER_KEY,
  LABEL_KEY,
  REF_KEY,
  WAREHOUSE_COUNT_KEY,
];
const REGIONED_ITEM_KEYS: readonly string[] = [
  COURIER_KEY,
  LABEL_KEY,
  REF_KEY,
  REGION_KEY,
  WAREHOUSE_COUNT_KEY,
];

const CAPTURED_ADDRESSES: readonly unknown[] = [
  {
    Present: KYIV_PRESENT,
    Warehouses: CAPTURED_KYIV_WAREHOUSES,
    MainDescription: KYIV_MAIN_DESCRIPTION,
    Area: KYIV_AREA,
    Region: "",
    SettlementTypeCode: "м.",
    Ref: KYIV_SETTLEMENT_REF,
    DeliveryCity: KYIV_DELIVERY_CITY,
    AddressDeliveryAllowed: true,
    StreetsAvailability: true,
    ParentRegionTypes: "область",
    ParentRegionCode: "обл.",
    RegionTypes: "",
    RegionTypesCode: "",
  },
  {
    Present: KYIVETS_PRESENT,
    Warehouses: CAPTURED_KYIVETS_WAREHOUSES,
    MainDescription: "Київець",
    Area: "Львівська",
    Region: "Миколаївський",
    SettlementTypeCode: "с.",
    Ref: KYIVETS_SETTLEMENT_REF,
    DeliveryCity: KYIVETS_DELIVERY_CITY,
    AddressDeliveryAllowed: true,
    StreetsAvailability: false,
    ParentRegionTypes: "область",
    ParentRegionCode: "обл.",
    RegionTypes: "район",
    RegionTypesCode: "р-н",
  },
];

const CAPTURED_PRESENTS: readonly string[] = [KYIV_PRESENT, KYIVETS_PRESENT];

const CAPTURED_ITEMS: readonly unknown[] = [
  {
    ref: KYIV_DELIVERY_CITY,
    label: KYIV_LABEL,
    region: KYIV_REGION,
    warehouseCount: CAPTURED_KYIV_WAREHOUSES,
    isCourierAllowed: ALLOWED_COURIER,
  },
  {
    ref: KYIVETS_DELIVERY_CITY,
    label: KYIVETS_LABEL,
    region: KYIVETS_REGION,
    warehouseCount: CAPTURED_KYIVETS_WAREHOUSES,
    isCourierAllowed: ALLOWED_COURIER,
  },
];

const NO_SEPARATOR_ADDRESS = {
  Present: CHERNIHIV_PRESENT,
  MainDescription: CHERNIHIV_MAIN_DESCRIPTION,
  Area: CHERNIHIV_AREA,
  DeliveryCity: CHERNIHIV_DELIVERY_CITY,
};

const PROBED_ENCODING_ADDRESS = {
  ...NO_SEPARATOR_ADDRESS,
  Warehouses: PROBED_WAREHOUSE_TEXT,
  AddressDeliveryAllowed: DENIED_COURIER_TEXT,
};

const HEADLESS_PRESENT_ADDRESS = {
  Present: HEADLESS_PRESENT,
  MainDescription: KYIV_MAIN_DESCRIPTION,
  Area: KYIV_AREA,
  DeliveryCity: KYIV_DELIVERY_CITY,
};

const UNNAMED_HEADLESS_ADDRESS = {
  Present: HEADLESS_PRESENT,
  MainDescription: EMPTY_TEXT,
  Area: KYIV_AREA,
  DeliveryCity: SUMY_DELIVERY_CITY,
};

const FALLBACK_ADDRESS = {
  Present: EMPTY_TEXT,
  MainDescription: DUBOVE_MAIN_DESCRIPTION,
  Area: DUBOVE_AREA,
  DeliveryCity: DUBOVE_DELIVERY_CITY,
};

const AREALESS_FALLBACK_ADDRESS = {
  Present: EMPTY_TEXT,
  MainDescription: TYSA_MAIN_DESCRIPTION,
  Area: EMPTY_TEXT,
  DeliveryCity: TYSA_DELIVERY_CITY,
};

const REFLESS_ADDRESS = {
  Present: KYIV_PRESENT,
  MainDescription: KYIV_MAIN_DESCRIPTION,
  Area: KYIV_AREA,
  DeliveryCity: EMPTY_TEXT,
};

const LABELLESS_ADDRESS = {
  Present: EMPTY_TEXT,
  MainDescription: EMPTY_TEXT,
  Area: "Сумська",
  DeliveryCity: SUMY_DELIVERY_CITY,
};

const MIXED_ADDRESSES: readonly unknown[] = [
  ...CAPTURED_ADDRESSES,
  NO_SEPARATOR_ADDRESS,
];

const DROPPED_ADDRESSES: readonly unknown[] = [
  REFLESS_ADDRESS,
  LABELLESS_ADDRESS,
  NON_OBJECT_ADDRESS,
  NO_SEPARATOR_ADDRESS,
];

const FALLBACK_ADDRESSES: readonly unknown[] = [
  FALLBACK_ADDRESS,
  AREALESS_FALLBACK_ADDRESS,
];

const OVERLONG_ADDRESS = {
  Present: `${OVERLONG_LABEL}${PRESENT_SEPARATOR}${OVERLONG_LABEL}`,
  MainDescription: OVERLONG_LABEL,
  Area: OVERLONG_LABEL,
  DeliveryCity: OVERLONG_DELIVERY_CITY,
};

const OVERLONG_REF_ADDRESS = {
  Present: CHERNIHIV_PRESENT,
  MainDescription: CHERNIHIV_MAIN_DESCRIPTION,
  Area: CHERNIHIV_AREA,
  DeliveryCity: OVERLONG_REF,
};

const UNDECODABLE_ADDRESSES: readonly unknown[] = [
  { ...NO_SEPARATOR_ADDRESS, DeliveryCity: 6231 },
  { ...FALLBACK_ADDRESS, DeliveryCity: 6232 },
];

const KNOWN_WAREHOUSE_COUNTS: readonly [string, unknown, number][] = [
  ["a number", CAPTURED_KYIV_WAREHOUSES, CAPTURED_KYIV_WAREHOUSES],
  ["a zero number", ZERO_WAREHOUSES, ZERO_WAREHOUSES],
  ["a numeric string", PROBED_WAREHOUSE_TEXT, PROBED_WAREHOUSE_COUNT],
  ["a zero string", ZERO_WAREHOUSE_TEXT, ZERO_WAREHOUSES],
  ["a padded numeric string", PADDED_WAREHOUSE_TEXT, PADDED_WAREHOUSE_COUNT],
];

const UNKNOWN_WAREHOUSE_COUNTS: readonly [string, unknown][] = [
  ["a negative number", NEGATIVE_WAREHOUSES],
  ["a negative numeric string", NEGATIVE_WAREHOUSE_TEXT],
  ["a fractional string", FRACTIONAL_WAREHOUSE_TEXT],
  ["a fractional number", FRACTIONAL_WAREHOUSES],
  ["a word", GARBAGE_WAREHOUSE_TEXT],
  ["an empty string", EMPTY_TEXT],
  ["a boolean", true],
  ["a null", null],
  ["an object", {}],
  ["an array", []],
  ["an absent field", undefined],
];

const COURIER_ENCODINGS: readonly [string, unknown, boolean][] = [
  ["the boolean true", true, ALLOWED_COURIER],
  ["the boolean false", false, DENIED_COURIER],
  ["the number one", ALLOWED_COURIER_CODE, ALLOWED_COURIER],
  ["the number zero", DENIED_COURIER_CODE, DENIED_COURIER],
  ["the string one", ALLOWED_COURIER_TEXT, ALLOWED_COURIER],
  ["the string zero", DENIED_COURIER_TEXT, DENIED_COURIER],
  ["a padded string one", PADDED_ALLOWED_COURIER_TEXT, ALLOWED_COURIER],
  ["a padded string zero", PADDED_DENIED_COURIER_TEXT, DENIED_COURIER],
  ["the string false", FALSE_COURIER_TEXT, DENIED_COURIER],
  ["the string true", TRUE_COURIER_TEXT, ALLOWED_COURIER],
];

const UNREADABLE_COURIER_FLAGS: readonly [string, unknown][] = [
  ["an absent field", undefined],
  ["a null", null],
  ["an empty string", EMPTY_TEXT],
  ["a number that is neither one nor zero", STRAY_COURIER_CODE],
  ["a word", GARBAGE_COURIER_TEXT],
  ["an object", {}],
  ["an array", []],
];

interface NestingCase {
  query: string;
  data: readonly unknown[];
}

const NESTING_CASES: readonly NestingCase[] = [
  { query: FIRST_NESTING_QUERY, data: [{}] },
  {
    query: SECOND_NESTING_QUERY,
    data: [{ TotalCount: 0, Addresses: BROKEN_ADDRESSES }],
  },
  { query: THIRD_NESTING_QUERY, data: [{ TotalCount: 0, Addresses: [] }] },
];

const FORBIDDEN_BODY_FRAGMENTS: readonly string[] = [
  "DeliveryCity",
  "TotalCount",
  "MainDescription",
  "Warehouses",
  NP_HOST,
  KYIV_SETTLEMENT_REF,
  KYIVETS_SETTLEMENT_REF,
];

const loadRoute = () => import("@root/app/api/np/settlements/route");

const buildRequestUrl = (query: string | null): string =>
  query === null
    ? ROUTE_URL
    : `${ROUTE_URL}?${QUERY_PARAM}=${encodeURIComponent(query)}`;

const buildRequest = (query: string | null): NextRequest =>
  new NextRequest(buildRequestUrl(query), {
    headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP },
  });

const buildAnonymousRequest = (query: string): NextRequest =>
  new NextRequest(buildRequestUrl(query));

const buildIndexedQuery = (index: number): string =>
  `${INDEXED_QUERY_PREFIX}${index}`;

const settlementsResponse = (addresses: readonly unknown[]): Response =>
  jsonResponse(
    {
      success: true,
      data: [{ TotalCount: addresses.length, Addresses: addresses }],
    },
    OK_STATUS
  );

const buildAddresses = (count: number): readonly unknown[] =>
  Array.from({ length: count }, (_unused, index) => ({
    Present: `с. Село ${index}${PRESENT_SEPARATOR}Тестова обл.`,
    MainDescription: `Село ${index}`,
    Area: "Тестова",
    DeliveryCity: `db5c88a${index}-391c-11dd-90d9-001a92567626`,
  }));

const buildCountedAddress = (warehouses: unknown): Record<string, unknown> => ({
  ...NO_SEPARATOR_ADDRESS,
  Warehouses: warehouses,
});

const buildCourierAddress = (isAllowed: unknown): Record<string, unknown> => ({
  ...NO_SEPARATOR_ADDRESS,
  AddressDeliveryAllowed: isAllowed,
});

const buildRawNumberEnvelope = async (jsonNumber: string): Promise<string> => {
  const envelope = await settlementsResponse([
    buildCountedAddress(RAW_NUMBER_PLACEHOLDER),
  ]).text();

  return envelope.replace(`"${RAW_NUMBER_PLACEHOLDER}"`, jsonNumber);
};

const rawEnvelopeResponse = (envelope: string): Response =>
  new Response(envelope, { status: OK_STATUS, headers: JSON_HEADERS });

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

const expectNoUpstreamLeak = (body: string): void => {
  for (const fragment of FORBIDDEN_BODY_FRAGMENTS) {
    expect(body).not.toContain(fragment);
  }
};

const readItems = async (response: Response): Promise<readonly unknown[]> => {
  const payload: unknown = await response.json();

  return isRecord(payload) && Array.isArray(payload.items) ? payload.items : [];
};

const readItemKeys = (item: unknown): readonly string[] =>
  isRecord(item) ? Object.keys(item).sort() : [];

const readOptionalText = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const readLabelLength = (item: unknown): number =>
  isRecord(item) ? (readOptionalText(item.label) ?? EMPTY_TEXT).length : 0;

const readWarehouseCount = (item: unknown): unknown =>
  isRecord(item) ? item.warehouseCount : undefined;

const readCourierFlag = (item: unknown): unknown =>
  isRecord(item) ? item.isCourierAllowed : undefined;

const composePresent = (item: unknown): string => {
  if (!isRecord(item)) {
    return EMPTY_TEXT;
  }

  const label = readOptionalText(item.label) ?? EMPTY_TEXT;
  const region = readOptionalText(item.region);

  return region === undefined ? label : `${label}${PRESENT_SEPARATOR}${region}`;
};

const readSentEnvelope = (fetchStub: Mock<FetchStub>): unknown => {
  const [, init] = fetchStub.mock.calls[0];
  const body = init?.body;

  return typeof body === "string" ? JSON.parse(body) : null;
};

const readSentCityName = (fetchStub: Mock<FetchStub>): string => {
  const envelope = readSentEnvelope(fetchStub);

  if (!isRecord(envelope) || !isRecord(envelope.methodProperties)) {
    return EMPTY_TEXT;
  }

  return readOptionalText(envelope.methodProperties.CityName) ?? EMPTY_TEXT;
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

describe("GET /api/np/settlements", () => {
  it("opts out of static rendering so the handler is never prerendered", async () => {
    const { dynamic } = await loadRoute();

    expect(dynamic).toBe(DYNAMIC_MODE);
  });

  it("answers 503 without touching the network when the api key is absent", async () => {
    vi.stubEnv(NP_API_KEY_NAME, undefined);

    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoUpstreamLeak(body);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers 503 when the upstream status is not ok", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        jsonResponse(
          { success: true, data: [{ Addresses: CAPTURED_ADDRESSES }] },
          BAD_GATEWAY_STATUS
        )
      )
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoUpstreamLeak(body);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when np reports success false at http 200", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        jsonResponse(
          { success: false, data: [], errors: [], errorCodes: [] },
          OK_STATUS
        )
      )
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when the upstream body is malformed json", async () => {
    silenceErrorLog();

    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        new Response(MALFORMED_BODY, {
          status: OK_STATUS,
          headers: JSON_HEADERS,
        })
      )
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(await response.text()).toBe(UNAVAILABLE_BODY);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when the upstream request times out", async () => {
    silenceErrorLog();

    const fetchStub = stubUpstream(() =>
      Promise.reject(
        new DOMException(TIMEOUT_ERROR_MESSAGE, TIMEOUT_ERROR_NAME)
      )
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoUpstreamLeak(body);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("asks np for a single capped page of the normalized query", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(PADDED_KYIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
    expect(readSentEnvelope(fetchStub)).toEqual({
      apiKey: FAKE_API_KEY,
      modelName: NP_MODEL_NAME,
      calledMethod: SETTLEMENTS_METHOD,
      methodProperties: {
        CityName: NORMALIZED_KYIV_QUERY,
        Limit: String(SETTLEMENT_ROW_LIMIT),
        Page: FIRST_PAGE,
      },
    });
  });

  it("slices an overlong query to sixty-four characters before it reaches np", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(OVERLONG_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readSentCityName(fetchStub)).toHaveLength(MAX_QUERY_LENGTH);
    expect(readSentCityName(fetchStub)).toBe(SLICED_QUERY);
  });

  it("maps the captured np rows to the minimized settlement contract", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(KYIV_QUERY));
    const body = await response.text();

    expect(response.status).toBe(OK_STATUS);
    expect(JSON.parse(body)).toStrictEqual({ items: CAPTURED_ITEMS });
    expectNoUpstreamLeak(body);
    expect(body).toContain(KYIV_DELIVERY_CITY);
    expect(body).toContain(KYIVETS_DELIVERY_CITY);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("splits the np present string into a label and a region losslessly", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(KYIV_QUERY)));

    expect(items.map(composePresent)).toEqual(CAPTURED_PRESENTS);
  });

  it("omits the region when the present string carries no regional tail", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([NO_SEPARATOR_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(KYIV_QUERY)));

    expect(items).toStrictEqual([
      {
        ref: CHERNIHIV_DELIVERY_CITY,
        label: CHERNIHIV_PRESENT,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
    expect(readItemKeys(items[0])).toEqual(REGIONLESS_ITEM_KEYS);
  });

  it("falls back to the main description and area when present is blank", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse(FALLBACK_ADDRESSES))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(FALLBACK_QUERY)));

    expect(items).toStrictEqual([
      {
        ref: DUBOVE_DELIVERY_CITY,
        label: DUBOVE_MAIN_DESCRIPTION,
        region: DUBOVE_AREA,
        ...ABSENT_DELIVERY_FACTS,
      },
      {
        ref: TYSA_DELIVERY_CITY,
        label: TYSA_MAIN_DESCRIPTION,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
  });

  it("falls back to the main description when the present string splits to an empty label", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([HEADLESS_PRESENT_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const response = await GET(buildRequest(HEADLESS_PRESENT_QUERY));
    const items = await readItems(response);

    expect(response.status).toBe(OK_STATUS);
    expect(items).toStrictEqual([
      {
        ref: KYIV_DELIVERY_CITY,
        label: KYIV_MAIN_DESCRIPTION,
        region: KYIV_AREA,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
    expect(items.map(readLabelLength)).not.toContain(EMPTY_TEXT.length);
  });

  it("drops a row that splits to an empty label with no main description to fall back on", async () => {
    stubUpstream(() =>
      Promise.resolve(
        settlementsResponse([UNNAMED_HEADLESS_ADDRESS, NO_SEPARATOR_ADDRESS])
      )
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(UNNAMED_ROW_QUERY)));

    expect(items).toStrictEqual([
      {
        ref: CHERNIHIV_DELIVERY_CITY,
        label: CHERNIHIV_PRESENT,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
  });

  it("answers 503 when every row splits to an empty label and none can be named", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse([UNNAMED_HEADLESS_ADDRESS]))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(UNNAMED_ROW_QUERY));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoUpstreamLeak(body);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("caps an overlong label and region so one bad row cannot pin the cache", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([OVERLONG_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const items = await readItems(
      await GET(buildRequest(OVERLONG_LABEL_QUERY))
    );

    expect(items).toStrictEqual([
      {
        ref: OVERLONG_DELIVERY_CITY,
        label: CAPPED_LABEL,
        region: CAPPED_LABEL,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
    expect(items.map(readLabelLength)).toEqual([LABEL_CAP]);
  });

  it("drops rows without a delivery city ref, without a label, or not shaped as objects", async () => {
    stubUpstream(() => Promise.resolve(settlementsResponse(DROPPED_ADDRESSES)));

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(DROPPED_QUERY)));

    expect(items).toStrictEqual([
      {
        ref: CHERNIHIV_DELIVERY_CITY,
        label: CHERNIHIV_PRESENT,
        ...ABSENT_DELIVERY_FACTS,
      },
    ]);
  });

  it("emits nothing but the contract keys on every item", async () => {
    stubUpstream(() => Promise.resolve(settlementsResponse(MIXED_ADDRESSES)));

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(MIXED_QUERY)));

    expect(items.map(readItemKeys)).toEqual([
      REGIONED_ITEM_KEYS,
      REGIONED_ITEM_KEYS,
      REGIONLESS_ITEM_KEYS,
    ]);
  });

  it("reads the string-encoded delivery facts the live probe reported, not only the numbers the captured fixture carries", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([PROBED_ENCODING_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const items = await readItems(
      await GET(buildRequest(PROBED_ENCODING_QUERY))
    );

    expect(items).toStrictEqual([
      {
        ref: CHERNIHIV_DELIVERY_CITY,
        label: CHERNIHIV_PRESENT,
        warehouseCount: PROBED_WAREHOUSE_COUNT,
        isCourierAllowed: DENIED_COURIER,
      },
    ]);
  });

  it.each(KNOWN_WAREHOUSE_COUNTS)(
    "reads %s as the warehouse count the picker will show",
    async (_label, raw, count) => {
      stubUpstream(() =>
        Promise.resolve(settlementsResponse([buildCountedAddress(raw)]))
      );

      const { GET } = await loadRoute();
      const items = await readItems(
        await GET(buildRequest(WAREHOUSE_COUNT_QUERY))
      );

      expect(items.map(readWarehouseCount)).toEqual([count]);
    }
  );

  it.each(UNKNOWN_WAREHOUSE_COUNTS)(
    "reads %s as an unknown warehouse count rather than inventing a number",
    async (_label, raw) => {
      stubUpstream(() =>
        Promise.resolve(settlementsResponse([buildCountedAddress(raw)]))
      );

      const { GET } = await loadRoute();
      const items = await readItems(
        await GET(buildRequest(WAREHOUSE_COUNT_QUERY))
      );

      expect(items.map(readWarehouseCount)).toEqual([UNKNOWN_WAREHOUSE_COUNT]);
    }
  );

  it("reads a warehouse count whose exponent overflows to infinity as unknown", async () => {
    const envelope = await buildRawNumberEnvelope(OVERFLOWING_JSON_NUMBER);

    expect(envelope).not.toContain(RAW_NUMBER_PLACEHOLDER);
    expect(envelope).toContain(OVERFLOWING_JSON_NUMBER);

    stubUpstream(() => Promise.resolve(rawEnvelopeResponse(envelope)));

    const { GET } = await loadRoute();
    const response = await GET(buildRequest(OVERFLOWING_COUNT_QUERY));
    const items = await readItems(response);

    expect(response.status).toBe(OK_STATUS);
    expect(items.map(readWarehouseCount)).toEqual([UNKNOWN_WAREHOUSE_COUNT]);
  });

  it.each(COURIER_ENCODINGS)(
    "reads %s as the courier flag it encodes",
    async (_label, raw, isAllowed) => {
      stubUpstream(() =>
        Promise.resolve(settlementsResponse([buildCourierAddress(raw)]))
      );

      const { GET } = await loadRoute();
      const items = await readItems(await GET(buildRequest(COURIER_QUERY)));

      expect(items.map(readCourierFlag)).toEqual([isAllowed]);
    }
  );

  it.each(UNREADABLE_COURIER_FLAGS)(
    "falls open to an allowed courier when the flag arrives as %s, because an unparsed flag must never hide a delivery method",
    async (_label, raw) => {
      stubUpstream(() =>
        Promise.resolve(settlementsResponse([buildCourierAddress(raw)]))
      );

      const { GET } = await loadRoute();
      const items = await readItems(await GET(buildRequest(COURIER_QUERY)));

      expect(items.map(readCourierFlag)).toEqual([FAIL_OPEN_COURIER]);
    }
  );

  it("keeps the courier flag allowed for a row that never mentions courier delivery at all", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([NO_SEPARATOR_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(COURIER_QUERY)));

    expect(items.map(readCourierFlag)).toEqual([FAIL_OPEN_COURIER]);
    expect(items.map(readWarehouseCount)).toEqual([UNKNOWN_WAREHOUSE_COUNT]);
  });

  it("caps the answer at ten settlements when np returns more", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse(buildAddresses(OVERSIZED_ROW_COUNT)))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(OVERSIZED_QUERY)));

    expect(items).toHaveLength(SETTLEMENT_ROW_LIMIT);
  });

  it("answers an empty list without touching the network for an absent or blank query", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const absent = await GET(buildRequest(null));
    const blank = await GET(buildRequest(BLANK_QUERY));

    expect(absent.status).toBe(OK_STATUS);
    expect(await absent.text()).toBe(EMPTY_ITEMS_BODY);
    expect(blank.status).toBe(OK_STATUS);
    expect(await blank.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers an empty list without touching the network for a single character query", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(SHORT_QUERY));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers an empty list without touching the network for invisible characters", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(INVISIBLE_QUERY));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("strips an invisible character out of a real query before it reaches np", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(SPLIT_KYIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readSentCityName(fetchStub)).toBe(NORMALIZED_KYIV_QUERY);
  });

  it("answers an empty list without touching the network for the bidi controls the retired hand-list let through", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(BIDI_INVISIBLE_QUERY));

    expect(response.status).toBe(OK_STATUS);
    expect(await response.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("strips a bidi isolate pair off a real query before it reaches np", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(ISOLATED_KYIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readSentCityName(fetchStub)).toBe(NORMALIZED_KYIV_QUERY);
  });

  it("caps an overlong np delivery city ref to sixty-four characters", async () => {
    stubUpstream(() =>
      Promise.resolve(settlementsResponse([OVERLONG_REF_ADDRESS]))
    );

    const { GET } = await loadRoute();
    const items = await readItems(await GET(buildRequest(OVERLONG_REF_QUERY)));

    expect(items).toStrictEqual([
      { ref: CAPPED_REF, label: CHERNIHIV_PRESENT, ...ABSENT_DELIVERY_FACTS },
    ]);
  });

  it("answers an empty list when the np envelope nests nothing usable", async () => {
    let caseIndex = 0;

    const fetchStub = stubUpstream(() => {
      const nestingCase = NESTING_CASES[caseIndex];

      caseIndex += 1;

      return Promise.resolve(
        jsonResponse({ success: true, data: nestingCase.data }, OK_STATUS)
      );
    });
    const { GET } = await loadRoute();

    const statuses: number[] = [];
    const bodies: string[] = [];

    for (const nestingCase of NESTING_CASES) {
      const response = await GET(buildRequest(nestingCase.query));

      statuses.push(response.status);
      bodies.push(await response.text());
    }

    expect(statuses).toEqual(Array(NESTING_CASES.length).fill(OK_STATUS));
    expect(bodies).toEqual(Array(NESTING_CASES.length).fill(EMPTY_ITEMS_BODY));
    expect(fetchStub).toHaveBeenCalledTimes(NESTING_CASES.length);
  });

  it("answers 503 and remembers the failure briefly when np returns an empty data envelope", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(jsonResponse({ success: true, data: [] }, OK_STATUS))
    );
    const { GET } = await loadRoute();

    const first = await GET(buildRequest(EMPTY_DATA_QUERY));
    const firstBody = await first.text();
    const second = await GET(buildRequest(EMPTY_DATA_QUERY));

    expect(first.status).toBe(UNAVAILABLE_STATUS);
    expect(firstBody).toBe(UNAVAILABLE_BODY);
    expect(second.status).toBe(UNAVAILABLE_STATUS);
    expect(await second.text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 503 when the np container carries rows it can decode none of", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(UNDECODABLE_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const response = await GET(buildRequest(UNDECODABLE_QUERY));
    const body = await response.text();

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(body).toBe(UNAVAILABLE_BODY);
    expectNoUpstreamLeak(body);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("serves repeated identical queries from the cache with a single upstream call", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const bodies: string[] = [];

    for (let attempt = 0; attempt < REPEATED_REQUEST_COUNT; attempt += 1) {
      const response = await GET(buildRequest(KYIV_QUERY));

      bodies.push(await response.text());
    }

    expect(bodies[0]).toBe(bodies[1]);
    expect(bodies[1]).toBe(bodies[2]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("caches an empty result so a repeated miss never reaches np again", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse([]))
    );
    const { GET } = await loadRoute();

    const first = await GET(buildRequest(LVIV_QUERY));
    const second = await GET(buildRequest(LVIV_QUERY));

    expect(await first.text()).toBe(EMPTY_ITEMS_BODY);
    expect(await second.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("normalizes the query so equivalent spellings share one cache entry", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const padded = await GET(buildRequest(PADDED_KYIV_QUERY));
    const plain = await GET(buildRequest(KYIV_QUERY));

    expect(await plain.text()).toBe(await padded.text());
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("keeps a settlement answer for five minutes and reloads the moment they elapse", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(KYIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + SETTLEMENT_CACHE_TTL_MS - 1);

    const warm = await GET(buildRequest(KYIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(1);

    vi.setSystemTime(BASE_TIME + SETTLEMENT_CACHE_TTL_MS);

    const stale = await GET(buildRequest(KYIV_QUERY));

    expect(await readItems(warm)).toStrictEqual(CAPTURED_ITEMS);
    expect(await readItems(stale)).toStrictEqual(CAPTURED_ITEMS);
    expect(fetchStub).toHaveBeenCalledTimes(SETTLEMENT_TTL_RELOAD_COUNT);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("remembers two thousand queries and drops the least recent when the next arrives", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    for (let index = 0; index < CACHED_QUERY_COUNT; index += 1) {
      const filled = await GET(buildAnonymousRequest(buildIndexedQuery(index)));

      expect(filled.status).toBe(OK_STATUS);
    }

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_QUERY_COUNT);

    await GET(buildAnonymousRequest(buildIndexedQuery(RETAINED_QUERY_INDEX)));

    expect(fetchStub).toHaveBeenCalledTimes(CACHED_QUERY_COUNT);

    await GET(buildAnonymousRequest(buildIndexedQuery(EVICTED_QUERY_INDEX)));

    expect(fetchStub).toHaveBeenCalledTimes(EVICTION_RELOAD_COUNT);
  });

  it("issues one upstream call per distinct query", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    await GET(buildRequest(KYIV_QUERY));
    await GET(buildRequest(LVIV_QUERY));

    expect(fetchStub).toHaveBeenCalledTimes(2);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("answers 429 with a Retry-After header once the directory budget is spent", async () => {
    const fetchStub = stubUpstream(() =>
      Promise.resolve(settlementsResponse(CAPTURED_ADDRESSES))
    );
    const { GET } = await loadRoute();

    const allowedStatuses: number[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      const allowed = await GET(buildRequest(KYIV_QUERY));

      allowedStatuses.push(allowed.status);
    }

    const blocked = await GET(buildRequest(LVIV_QUERY));

    expect(allowedStatuses).toEqual(
      Array(DIRECTORY_MAX_REQUESTS).fill(OK_STATUS)
    );
    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);

    const retryAfter = Number(blocked.headers.get(RETRY_AFTER_HEADER));

    expect(retryAfter).toBeGreaterThanOrEqual(MIN_RETRY_AFTER_SECONDS);
    expect(retryAfter).toBeLessThanOrEqual(MAX_RETRY_AFTER_SECONDS);

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });
});
