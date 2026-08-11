import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import type { FetchStub } from "../../../support/apiTest";
import {
  expectUpstreamOnly,
  jsonResponse,
  stubUpstream,
} from "../../../support/apiTest";

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_MODEL_NAME = "Address";
const NP_REQUEST_TIMEOUT_MS = 2500;
const NP_API_KEY_NAME = "NOVA_POSHTA_API_KEY";
const FAKE_API_KEY = "np-test-key";

const SETTLEMENTS_METHOD = "searchSettlements";
const WAREHOUSES_METHOD = "getWarehouses";

const SETTLEMENT_PROPERTIES = { CityName: "льв", Limit: "10", Page: "1" };
const WAREHOUSE_PROPERTIES = {
  CityRef: "8d5a980d-391c-11dd-90d9-001a92567626",
  Page: "1",
  Limit: "500",
};

const REQUEST_METHOD = "POST";
const NO_STORE = "no-store";
const ERROR_REDIRECT = "error";
const CONTENT_TYPE_HEADER = "Content-Type";
const JSON_CONTENT_TYPE = "application/json";
const JSON_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };

const OK_STATUS = 200;
const BAD_GATEWAY_STATUS = 502;

const NP_ROWS: readonly unknown[] = [{ TotalCount: 1, Addresses: [] }];
const MALFORMED_BODY = "np gateway error page";
const NON_OBJECT_PAYLOAD = "directory offline";

const DISTRESS_RESULT = { kind: "distress" };
const REJECTED_RESULT = { kind: "rejected" };
const LOG_MESSAGE = "Failed to reach the delivery directory:";

const CITY_NOT_FOUND_CODE = "20000900768";
const THROTTLE_CODE = "20000401501";
const THROTTLE_TEXT = "To many requests";
const CITY_NOT_FOUND_TEXT = "City not found";

const TIMEOUT_ERROR_NAME = "TimeoutError";
const TIMEOUT_ERROR_MESSAGE = "The operation was aborted due to timeout";

const SAMPLE_TEXT = "  м. Київ  ";
const TRIMMED_TEXT = "м. Київ";
const SAMPLE_NUMBER = 42;
const EMPTY_TEXT = "";

const loadClient = () => import("@root/app/api/np/client");

const loadRefusal = () => import("@root/app/api/np/refusal");

const refusedValue = async (): Promise<symbol> => {
  const { CARRIER_REFUSED } = await loadRefusal();

  return CARRIER_REFUSED;
};

const rejectedEnvelope = (payload: Record<string, unknown>): Response =>
  jsonResponse({ success: false, data: [], ...payload }, OK_STATUS);

const successResponse = (): Response =>
  jsonResponse({ success: true, data: NP_ROWS }, OK_STATUS);

const readSentInit = (fetchStub: Mock<FetchStub>): RequestInit | undefined => {
  const [, init] = fetchStub.mock.calls[0];

  return init;
};

const readSentEnvelope = (init: RequestInit | undefined): unknown => {
  const body = init?.body;

  return typeof body === "string" ? JSON.parse(body) : null;
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

describe("callNpDirectory", () => {
  it("refuses without touching the network when the api key is absent, because a missing key is our own state and never the carrier's word", async () => {
    vi.stubEnv(NP_API_KEY_NAME, undefined);

    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toBe(await refusedValue());
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("treats a blank api key as an absent one", async () => {
    vi.stubEnv(NP_API_KEY_NAME, EMPTY_TEXT);

    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toBe(await refusedValue());
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("posts the np envelope to the directory endpoint and nowhere else", async () => {
    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    await callNpDirectory(SETTLEMENTS_METHOD, SETTLEMENT_PROPERTIES);

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);

    const init = readSentInit(fetchStub);

    expect(init?.method).toBe(REQUEST_METHOD);
    expect(init?.cache).toBe(NO_STORE);
    expect(init?.headers).toEqual(JSON_HEADERS);
    expect(readSentEnvelope(init)).toEqual({
      apiKey: FAKE_API_KEY,
      modelName: NP_MODEL_NAME,
      calledMethod: SETTLEMENTS_METHOD,
      methodProperties: SETTLEMENT_PROPERTIES,
    });
  });

  it("refuses to follow a redirect that would carry the api key to another host", async () => {
    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    await callNpDirectory(SETTLEMENTS_METHOD, SETTLEMENT_PROPERTIES);

    expect(readSentInit(fetchStub)?.redirect).toBe(ERROR_REDIRECT);
  });

  it("sends page and limit as strings", async () => {
    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    await callNpDirectory(WAREHOUSES_METHOD, WAREHOUSE_PROPERTIES);

    expect(readSentEnvelope(readSentInit(fetchStub))).toEqual({
      apiKey: FAKE_API_KEY,
      modelName: NP_MODEL_NAME,
      calledMethod: WAREHOUSES_METHOD,
      methodProperties: WAREHOUSE_PROPERTIES,
    });
  });

  it("returns the data rows when the envelope reports success", async () => {
    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual({ kind: "rows", rows: NP_ROWS });
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("reads a non-ok upstream status as carrier distress", async () => {
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    stubUpstream(() =>
      Promise.resolve(
        jsonResponse({ success: true, data: NP_ROWS }, BAD_GATEWAY_STATUS)
      )
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it("reads a bare success false as a verdict about our own input, not as distress", async () => {
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    stubUpstream(() =>
      Promise.resolve(rejectedEnvelope({ errors: [], errorCodes: [] }))
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual(REJECTED_RESULT);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it("reads the carrier rejecting our city ref as a verdict, by its own error code", async () => {
    stubUpstream(() =>
      Promise.resolve(
        rejectedEnvelope({
          errors: [CITY_NOT_FOUND_TEXT],
          errorCodes: [CITY_NOT_FOUND_CODE],
        })
      )
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toEqual(REJECTED_RESULT);
  });

  it("reads the carrier's throttle code as distress, because that is the carrier asking us to stop", async () => {
    stubUpstream(() =>
      Promise.resolve(
        rejectedEnvelope({
          errors: [THROTTLE_TEXT],
          errorCodes: [THROTTLE_CODE],
        })
      )
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
  });

  it("reads the throttle code the carrier sends as a number, not only as a string", async () => {
    stubUpstream(() =>
      Promise.resolve(rejectedEnvelope({ errorCodes: [Number(THROTTLE_CODE)] }))
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
  });

  it("falls back to the throttle wording when the carrier sends no code at all", async () => {
    stubUpstream(() =>
      Promise.resolve(rejectedEnvelope({ errors: [THROTTLE_TEXT] }))
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
  });

  it("fails when the payload is not an object", async () => {
    stubUpstream(() =>
      Promise.resolve(jsonResponse(NON_OBJECT_PAYLOAD, OK_STATUS))
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
  });

  it("fails when the payload data is not an array", async () => {
    stubUpstream(() =>
      Promise.resolve(jsonResponse({ success: true, data: {} }, OK_STATUS))
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
  });

  it("fails and logs once when the response body is malformed json", async () => {
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    stubUpstream(() =>
      Promise.resolve(
        new Response(MALFORMED_BODY, {
          status: OK_STATUS,
          headers: JSON_HEADERS,
        })
      )
    );

    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it("fails and logs once when the request times out", async () => {
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const timeoutError = new DOMException(
      TIMEOUT_ERROR_MESSAGE,
      TIMEOUT_ERROR_NAME
    );

    const fetchStub = stubUpstream(() => Promise.reject(timeoutError));
    const { callNpDirectory } = await loadClient();

    const result = await callNpDirectory(
      SETTLEMENTS_METHOD,
      SETTLEMENT_PROPERTIES
    );

    expect(result).toEqual(DISTRESS_RESULT);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledWith(LOG_MESSAGE, timeoutError);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expectUpstreamOnly(fetchStub.mock.calls, NP_API_URL);
  });

  it("forwards a caller supplied signal verbatim", async () => {
    const timeoutSignals = vi.spyOn(AbortSignal, "timeout");
    const controller = new AbortController();

    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    await callNpDirectory(
      WAREHOUSES_METHOD,
      WAREHOUSE_PROPERTIES,
      controller.signal
    );

    expect(readSentInit(fetchStub)?.signal).toBe(controller.signal);
    expect(timeoutSignals).not.toHaveBeenCalled();
  });

  it("uses its own deadline when the caller passes no signal", async () => {
    const timeoutSignals = vi.spyOn(AbortSignal, "timeout");

    const fetchStub = stubUpstream(() => Promise.resolve(successResponse()));
    const { callNpDirectory } = await loadClient();

    await callNpDirectory(SETTLEMENTS_METHOD, SETTLEMENT_PROPERTIES);

    expect(timeoutSignals).toHaveBeenCalledTimes(1);
    expect(timeoutSignals).toHaveBeenCalledWith(NP_REQUEST_TIMEOUT_MS);
    expect(readSentInit(fetchStub)?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("isRecord", () => {
  it("accepts objects and rejects arrays, null and primitives", async () => {
    const { isRecord } = await loadClient();

    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord([SAMPLE_TEXT])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord(SAMPLE_TEXT)).toBe(false);
    expect(isRecord(SAMPLE_NUMBER)).toBe(false);
  });
});

describe("readString", () => {
  it("trims strings and answers empty for anything else", async () => {
    const { readString } = await loadClient();

    expect(readString(SAMPLE_TEXT)).toBe(TRIMMED_TEXT);
    expect(readString(EMPTY_TEXT)).toBe(EMPTY_TEXT);
    expect(readString(SAMPLE_NUMBER)).toBe(EMPTY_TEXT);
    expect(readString(null)).toBe(EMPTY_TEXT);
    expect(readString(undefined)).toBe(EMPTY_TEXT);
    expect(readString({})).toBe(EMPTY_TEXT);
  });
});
