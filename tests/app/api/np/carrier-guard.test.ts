import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { NextRequest } from "next/server";

import type { FetchStub } from "../../../support/apiTest";
import { jsonResponse, stubUpstream } from "../../../support/apiTest";

const BASE_TIME = new Date("2026-01-01T00:00:00.000Z").getTime();

const NP_API_KEY_NAME = "NOVA_POSHTA_API_KEY";
const FAKE_API_KEY = "np-test-key";

const SETTLEMENTS_URL = "https://example.test/api/np/settlements";
const WAREHOUSES_URL = "https://example.test/api/np/warehouses";
const FORWARDED_FOR_HEADER = "x-forwarded-for";
const CLIENT_IP = "203.0.113.11";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const BRANCH_METHOD = "branch";

const OK_STATUS = 200;
const BAD_GATEWAY_STATUS = 502;
const UNAVAILABLE_STATUS = 503;

const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';
const EMPTY_ITEMS_BODY = '{"items":[]}';

const FAILURE_THRESHOLD = 3;
const DAMPER_COOLDOWN_MS = 30_000;
const FAN_OUT_CAP = 12;
const BURST_SIZE = 40;
const REFUSED_COUNT = BURST_SIZE - FAN_OUT_CAP;

const SESSION_QUERY_COUNT = 6;
const RESET_SUCCESS_INDEX = 2;
const RESET_SESSION_CALL_COUNT = 5;
const COOLDOWN_PROBE_COUNT = 1;

const SETTLEMENT_QUERY = "льв";
const WAREHOUSES_CALLED_METHOD = "getWarehouses";
const NOT_PENDING = null;

const CITY_NOT_FOUND_CODE = "20000900768";
const THROTTLE_CODE = "20000401501";
const REFUSED_QUERY_INDEX = 30;
const DAMPED_QUERY_INDEX = 99;
const REFUSAL_OFFSET_MS = 10_000;
const NO_CALLS = 0;
const ONE_CALL = 1;

const BRANCH_ROW = {
  Number: "1",
  Description: "Відділення №1: вул. Соборна, 5",
  CategoryOfWarehouse: "Branch",
  WarehouseStatus: "Working",
  DenyToSelect: "0",
};

const UNDECODABLE_ROWS: readonly unknown[] = ["не об'єкт", { Number: "" }];

const UNKNOWN_CATEGORY_ROWS: readonly unknown[] = [
  { ...BRANCH_ROW, CategoryOfWarehouse: "Renamed" },
];

const SETTLEMENT_ROWS: readonly unknown[] = [
  {
    TotalCount: 1,
    Addresses: [
      {
        DeliveryCity: CITY_REF,
        Present: "м. Львів, Львівська обл.",
        Warehouses: 12,
        AddressDeliveryAllowed: "1",
      },
    ],
  },
];

const loadWarehousesRoute = () => import("@root/app/api/np/warehouses/route");

const loadSettlementsRoute = () => import("@root/app/api/np/settlements/route");

const buildWarehouseRequest = (query: string): NextRequest =>
  new NextRequest(
    `${WAREHOUSES_URL}?${new URLSearchParams({
      city: CITY_REF,
      method: BRANCH_METHOD,
      q: query,
    }).toString()}`,
    { headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP } }
  );

const buildSettlementRequest = (query: string): NextRequest =>
  new NextRequest(
    `${SETTLEMENTS_URL}?${new URLSearchParams({ q: query }).toString()}`,
    { headers: { [FORWARDED_FOR_HEADER]: CLIENT_IP } }
  );

const buildIndexedQuery = (index: number): string => `${index + 1}`;

const npResponse = (rows: readonly unknown[]): Response =>
  jsonResponse({ success: true, data: rows }, OK_STATUS);

const isWarehouseCall = (init: RequestInit | undefined): boolean =>
  typeof init?.body === "string" &&
  init.body.includes(WAREHOUSES_CALLED_METHOD);

const stubFailingUpstream = (): Mock<FetchStub> =>
  stubUpstream(() =>
    Promise.resolve(new Response(null, { status: BAD_GATEWAY_STATUS }))
  );

const stubRows = (rows: readonly unknown[]): Mock<FetchStub> =>
  stubUpstream(() => Promise.resolve(npResponse(rows)));

const refusedResponse = (code: string): Response =>
  jsonResponse(
    { success: false, data: [], errors: [], errorCodes: [code] },
    OK_STATUS
  );

const stubRefusingUpstream = (code: string): Mock<FetchStub> =>
  stubUpstream(() => Promise.resolve(refusedResponse(code)));

const flushPending = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const silenceErrorLog = (): void => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
};

const runWarehouseSession = async (
  count: number
): Promise<readonly number[]> => {
  const { GET } = await loadWarehousesRoute();
  const statuses: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const response = await GET(buildWarehouseRequest(buildIndexedQuery(index)));

    statuses.push(response.status);
  }

  return statuses;
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

describe("the carrier outage damper", () => {
  it("stops asking the carrier after three consecutive transport failures and answers the same 503", async () => {
    silenceErrorLog();

    const fetchStub = stubFailingUpstream();
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(
      Array(SESSION_QUERY_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(fetchStub).toHaveBeenCalledTimes(FAILURE_THRESHOLD);
  });

  it("keeps the damped answer byte-identical to the answer a real failure gives", async () => {
    silenceErrorLog();

    stubFailingUpstream();

    const { GET } = await loadWarehousesRoute();
    const attempted = await GET(buildWarehouseRequest(buildIndexedQuery(0)));

    for (let index = 1; index < FAILURE_THRESHOLD; index += 1) {
      await GET(buildWarehouseRequest(buildIndexedQuery(index)));
    }

    const damped = await GET(
      buildWarehouseRequest(buildIndexedQuery(SESSION_QUERY_COUNT))
    );

    const dampedBody = await damped.text();

    expect(damped.status).toBe(attempted.status);
    expect(dampedBody).toBe(await attempted.text());
    expect(dampedBody).toBe(UNAVAILABLE_BODY);
  });

  it("asks the carrier again once the cooldown elapses", async () => {
    silenceErrorLog();
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    const fetchStub = stubFailingUpstream();
    const { GET } = await loadWarehousesRoute();

    for (let index = 0; index < SESSION_QUERY_COUNT; index += 1) {
      await GET(buildWarehouseRequest(buildIndexedQuery(index)));
    }

    const armedCallCount = fetchStub.mock.calls.length;

    await GET(buildWarehouseRequest(buildIndexedQuery(SESSION_QUERY_COUNT)));

    expect(fetchStub).toHaveBeenCalledTimes(armedCallCount);

    vi.setSystemTime(BASE_TIME + DAMPER_COOLDOWN_MS);

    await GET(
      buildWarehouseRequest(buildIndexedQuery(SESSION_QUERY_COUNT + 1))
    );

    expect(fetchStub).toHaveBeenCalledTimes(
      armedCallCount + COOLDOWN_PROBE_COUNT
    );
  });

  it("forgets the failures a success interrupts, so a blip never damps the route", async () => {
    silenceErrorLog();

    let callIndex = 0;
    const fetchStub = stubUpstream(() => {
      const isSuccess = callIndex === RESET_SUCCESS_INDEX;

      callIndex += 1;

      return Promise.resolve(
        isSuccess
          ? npResponse([BRANCH_ROW])
          : new Response(null, { status: BAD_GATEWAY_STATUS })
      );
    });

    await runWarehouseSession(RESET_SESSION_CALL_COUNT);

    expect(fetchStub).toHaveBeenCalledTimes(RESET_SESSION_CALL_COUNT);
  });

  it("is never armed by a page the carrier answers successfully with no rows at all", async () => {
    const fetchStub = stubRows([]);
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(Array(SESSION_QUERY_COUNT).fill(OK_STATUS));
    expect(fetchStub).toHaveBeenCalledTimes(SESSION_QUERY_COUNT);
  });

  it("is never armed by a page it can structurally decode none of", async () => {
    const fetchStub = stubRows(UNDECODABLE_ROWS);
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(
      Array(SESSION_QUERY_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(fetchStub).toHaveBeenCalledTimes(SESSION_QUERY_COUNT);
  });

  it("is never armed by a page whose categories it does not recognise", async () => {
    const fetchStub = stubRows(UNKNOWN_CATEGORY_ROWS);
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(
      Array(SESSION_QUERY_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(fetchStub).toHaveBeenCalledTimes(SESSION_QUERY_COUNT);
  });

  it("is never armed by the carrier rejecting our own city ref, however many times we ask", async () => {
    const fetchStub = stubRefusingUpstream(CITY_NOT_FOUND_CODE);
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(
      Array(SESSION_QUERY_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(fetchStub).toHaveBeenCalledTimes(SESSION_QUERY_COUNT);
  });

  it("is armed by the throttle code the carrier answers when it wants us to stop", async () => {
    const fetchStub = stubRefusingUpstream(THROTTLE_CODE);
    const statuses = await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(statuses).toEqual(
      Array(SESSION_QUERY_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(fetchStub).toHaveBeenCalledTimes(FAILURE_THRESHOLD);
  });

  it("lets a carrier verdict interrupt a run of transport failures, because a carrier that answers us is not down", async () => {
    silenceErrorLog();

    let callIndex = 0;
    const fetchStub = stubUpstream(() => {
      const isVerdict = callIndex === RESET_SUCCESS_INDEX;

      callIndex += 1;

      return Promise.resolve(
        isVerdict
          ? refusedResponse(CITY_NOT_FOUND_CODE)
          : new Response(null, { status: BAD_GATEWAY_STATUS })
      );
    });

    await runWarehouseSession(RESET_SESSION_CALL_COUNT);

    expect(fetchStub).toHaveBeenCalledTimes(RESET_SESSION_CALL_COUNT);
  });

  it("damps both directory routes from one carrier, because np rate limits the key and not the method", async () => {
    silenceErrorLog();

    const fetchStub = stubFailingUpstream();

    await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(fetchStub).toHaveBeenCalledTimes(FAILURE_THRESHOLD);

    const settlements = await loadSettlementsRoute();
    const response = await settlements.GET(
      buildSettlementRequest(SETTLEMENT_QUERY)
    );

    expect(response.status).toBe(UNAVAILABLE_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(FAILURE_THRESHOLD);
  });

  it("lets a settlement search prove the carrier is back and lift the damper for both routes", async () => {
    silenceErrorLog();

    let isFailing = true;
    const fetchStub = stubUpstream((_input, init) =>
      Promise.resolve(
        isFailing
          ? new Response(null, { status: BAD_GATEWAY_STATUS })
          : npResponse(isWarehouseCall(init) ? [BRANCH_ROW] : SETTLEMENT_ROWS)
      )
    );

    await runWarehouseSession(SESSION_QUERY_COUNT);

    expect(fetchStub).toHaveBeenCalledTimes(FAILURE_THRESHOLD);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + DAMPER_COOLDOWN_MS);
    isFailing = false;

    const settlements = await loadSettlementsRoute();
    const revived = await settlements.GET(
      buildSettlementRequest(SETTLEMENT_QUERY)
    );

    expect(revived.status).toBe(OK_STATUS);

    const warehouses = await loadWarehousesRoute();
    const served = await warehouses.GET(
      buildWarehouseRequest(buildIndexedQuery(SESSION_QUERY_COUNT))
    );

    expect(served.status).not.toBe(UNAVAILABLE_STATUS);
  });
});

describe("the carrier fan-out bound", () => {
  it("answers 503 at once instead of queueing a request behind the calls already in flight", async () => {
    silenceErrorLog();

    const releases: (() => void)[] = [];
    const fetchStub = stubUpstream(
      () =>
        new Promise<Response>((resolve) => {
          releases.push(() => {
            resolve(npResponse([BRANCH_ROW]));
          });
        })
    );

    const { GET } = await loadWarehousesRoute();
    const statuses: (number | null)[] = Array(BURST_SIZE).fill(NOT_PENDING);

    const pending = Array.from({ length: BURST_SIZE }, (_value, index) =>
      GET(buildWarehouseRequest(buildIndexedQuery(index))).then((response) => {
        statuses[index] = response.status;

        return response;
      })
    );

    await flushPending();

    const refused = statuses.filter((status) => status === UNAVAILABLE_STATUS);
    const inFlight = statuses.filter((status) => status === NOT_PENDING);

    expect(fetchStub).toHaveBeenCalledTimes(FAN_OUT_CAP);
    expect(refused).toHaveLength(REFUSED_COUNT);
    expect(inFlight).toHaveLength(FAN_OUT_CAP);

    for (const release of releases) {
      release();
    }

    await Promise.all(pending);
  });

  it("never lets an over-cap refusal arm the damper", async () => {
    silenceErrorLog();

    const releases: (() => void)[] = [];
    let isGated = true;

    const fetchStub = stubUpstream(() =>
      isGated
        ? new Promise<Response>((resolve) => {
            releases.push(() => {
              resolve(npResponse([BRANCH_ROW]));
            });
          })
        : Promise.resolve(npResponse([BRANCH_ROW]))
    );

    const { GET } = await loadWarehousesRoute();
    const pending = Array.from({ length: BURST_SIZE }, (_value, index) =>
      GET(buildWarehouseRequest(buildIndexedQuery(index)))
    );

    await flushPending();

    isGated = false;

    for (const release of releases) {
      release();
    }

    await Promise.all(pending);

    const served = await GET(
      buildWarehouseRequest(buildIndexedQuery(BURST_SIZE))
    );

    expect(served.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(FAN_OUT_CAP + 1);
  });

  it("leaves no cache entry behind an over-cap refusal, so the carrier answers that query the moment a slot frees", async () => {
    const releases: (() => void)[] = [];
    let isGated = true;

    const fetchStub = stubUpstream(() =>
      isGated
        ? new Promise<Response>((resolve) => {
            releases.push(() => {
              resolve(npResponse([BRANCH_ROW]));
            });
          })
        : Promise.resolve(npResponse([BRANCH_ROW]))
    );

    const { GET } = await loadWarehousesRoute();
    const pending = Array.from({ length: FAN_OUT_CAP }, (_value, index) =>
      GET(buildWarehouseRequest(buildIndexedQuery(index)))
    );

    await flushPending();

    const saturatedCallCount = fetchStub.mock.calls.length;
    const refused = await GET(
      buildWarehouseRequest(buildIndexedQuery(REFUSED_QUERY_INDEX))
    );

    expect(refused.status).toBe(UNAVAILABLE_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(saturatedCallCount);

    isGated = false;

    for (const release of releases) {
      release();
    }

    await Promise.all(pending);

    const served = await GET(
      buildWarehouseRequest(buildIndexedQuery(REFUSED_QUERY_INDEX))
    );

    expect(served.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(saturatedCallCount + ONE_CALL);
  });

  it("leaves no cache entry behind a damped refusal, so the cooldown ends the outage instead of outliving it", async () => {
    silenceErrorLog();
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);

    let isFailing = true;
    const fetchStub = stubUpstream(() =>
      Promise.resolve(
        isFailing
          ? new Response(null, { status: BAD_GATEWAY_STATUS })
          : npResponse([BRANCH_ROW])
      )
    );

    const { GET } = await loadWarehousesRoute();

    for (let index = 0; index < FAILURE_THRESHOLD; index += 1) {
      await GET(buildWarehouseRequest(buildIndexedQuery(index)));
    }

    const armedCallCount = fetchStub.mock.calls.length;

    vi.setSystemTime(BASE_TIME + REFUSAL_OFFSET_MS);

    const refused = await GET(
      buildWarehouseRequest(buildIndexedQuery(DAMPED_QUERY_INDEX))
    );

    expect(refused.status).toBe(UNAVAILABLE_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(armedCallCount);

    isFailing = false;
    vi.setSystemTime(BASE_TIME + DAMPER_COOLDOWN_MS);

    const served = await GET(
      buildWarehouseRequest(buildIndexedQuery(DAMPED_QUERY_INDEX))
    );

    expect(served.status).toBe(OK_STATUS);
    expect(fetchStub).toHaveBeenCalledTimes(armedCallCount + ONE_CALL);
  });

  it("keeps serving a cached answer while the carrier is saturated", async () => {
    const releases: (() => void)[] = [];
    let isGated = false;

    const fetchStub = stubUpstream(() =>
      isGated
        ? new Promise<Response>((resolve) => {
            releases.push(() => {
              resolve(npResponse([BRANCH_ROW]));
            });
          })
        : Promise.resolve(npResponse([BRANCH_ROW]))
    );

    const { GET } = await loadWarehousesRoute();
    const warmed = await GET(buildWarehouseRequest(buildIndexedQuery(0)));

    expect(warmed.status).toBe(OK_STATUS);

    isGated = true;

    const pending = Array.from({ length: BURST_SIZE }, (_value, index) =>
      GET(buildWarehouseRequest(buildIndexedQuery(index + 1)))
    );

    await flushPending();

    const cached = await GET(buildWarehouseRequest(buildIndexedQuery(0)));

    expect(cached.status).toBe(OK_STATUS);
    expect(await cached.text()).not.toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).toHaveBeenCalledTimes(FAN_OUT_CAP + 1);

    for (const release of releases) {
      release();
    }

    await Promise.all(pending);
  });
});
