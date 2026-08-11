import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import {
  fetchSettlements,
  fetchWarehouses,
  type DirectoryResult,
} from "@root/components/checkout/directoryClient";

import type { FetchStub } from "../../support/apiTest";
import { jsonResponse, stubUpstream } from "../../support/apiTest";

const SETTLEMENTS_ROUTE = "/api/np/settlements";
const WAREHOUSES_ROUTE = "/api/np/warehouses";
const TEST_ORIGIN = "https://www.ua-tactical-gear.com";

const BRANCH_PARAM = "branch";
const POSTOMAT_PARAM = "postomat";

const CITY_PARAM = "city";
const METHOD_PARAM = "method";
const QUERY_PARAM = "q";

const OK_STATUS = 200;
const CREATED_STATUS = 201;
const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const THROTTLED_STATUS = 429;
const SERVER_ERROR_STATUS = 500;
const UNAVAILABLE_STATUS = 503;
const GATEWAY_TIMEOUT_STATUS = 504;

const OK_KIND = "ok";
const THROTTLED_KIND = "throttled";
const DOWN_KIND = "down";
const ABORTED_KIND = "aborted";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const CITY_LABEL = "с. Київець";
const CITY_REGION = "Миколаївський р-н, Львівська обл.";
const SECOND_CITY_REF = "e718a680-4b33-11e4-ab6d-005056801329";
const SECOND_CITY_LABEL = "м. Київ";

const WAREHOUSE_NUMBER = "1";
const WAREHOUSE_LABEL = "Відділення №1: вул. Городоцька, 359";
const SECOND_WAREHOUSE_NUMBER = "43";
const SECOND_WAREHOUSE_LABEL = "Поштомат №43: вул. Хрещатик, 22";

const KYIV_WAREHOUSE_COUNT = 12_298;
const NO_WAREHOUSES = 0;

const CITY_QUERY = "льв";
const WAREHOUSE_QUERY = "43";
const SPECIAL_QUERY = "kyiv & lviv";
const ENCODED_SPECIAL_QUERY = "kyiv%20%26%20lviv";
const EMPTY_TEXT = "";

const HTML_BODY = "<!doctype html><title>502 Bad Gateway</title>";
const NETWORK_ERROR_MESSAGE = "fetch failed";
const ABORT_ERROR_NAME = "AbortError";
const ABORT_ERROR_MESSAGE = "The user aborted a request.";

const DIRECTORY_DEADLINE_MS = 10_000;
const FIRST_ATTEMPT = 1;
const SINGLE_ATTEMPT = 1;
const ATTEMPTS_WITH_RETRY = 2;

const NOT_OK_MESSAGE = "The directory call did not answer ok but ";
const NON_STRING_URL_MESSAGE =
  "The directory client requested a non-string url";
const MISSING_SIGNAL_MESSAGE = "The directory client passed no abort signal";

const SETTLEMENT_ROW = {
  ref: CITY_REF,
  label: CITY_LABEL,
  region: CITY_REGION,
  warehouseCount: KYIV_WAREHOUSE_COUNT,
  isCourierAllowed: true,
};

const WAREHOUSE_ROW = {
  number: WAREHOUSE_NUMBER,
  label: WAREHOUSE_LABEL,
};

interface MalformedCase {
  label: string;
  body: unknown;
}

const MALFORMED_BODIES: readonly MalformedCase[] = [
  { label: "an envelope with no items key", body: {} },
  { label: "an items key that is an object", body: { items: {} } },
  { label: "an items key that is null", body: { items: null } },
  { label: "an items key that is a string", body: { items: EMPTY_TEXT } },
  { label: "a bare array where the envelope belongs", body: [] },
  { label: "a null body", body: null },
  { label: "a string body", body: EMPTY_TEXT },
  { label: "a number body", body: NO_WAREHOUSES },
  { label: "the proxy's own error envelope", body: { error: "unavailable" } },
];

const DOWN_STATUSES: readonly number[] = [
  BAD_REQUEST_STATUS,
  NOT_FOUND_STATUS,
  SERVER_ERROR_STATUS,
  UNAVAILABLE_STATUS,
  GATEWAY_TIMEOUT_STATUS,
];

interface CallerCase {
  label: string;
  call: (signal: AbortSignal) => Promise<DirectoryResult<unknown>>;
}

const CALLERS: readonly CallerCase[] = [
  {
    label: "fetchSettlements",
    call: (signal) => fetchSettlements(CITY_QUERY, signal),
  },
  {
    label: "fetchWarehouses",
    call: (signal) =>
      fetchWarehouses(CITY_REF, BRANCH_PARAM, WAREHOUSE_QUERY, signal),
  },
];

const freshSignal = (): AbortSignal => new AbortController().signal;

const respondWith =
  (payload: unknown, status: number): FetchStub =>
  () =>
    Promise.resolve(jsonResponse(payload, status));

const respondWithItems = (items: readonly unknown[]): FetchStub =>
  respondWith({ items }, OK_STATUS);

const readRequestedUrl = (fetchStub: Mock<FetchStub>): string => {
  const [input] = fetchStub.mock.calls[0];

  if (typeof input !== "string") {
    throw new Error(NON_STRING_URL_MESSAGE);
  }

  return input;
};

const readRequestedParams = (fetchStub: Mock<FetchStub>): URLSearchParams =>
  new URL(readRequestedUrl(fetchStub), TEST_ORIGIN).searchParams;

const expectOk = <T>(result: DirectoryResult<T>): readonly T[] => {
  if (result.kind !== OK_KIND) {
    throw new Error(`${NOT_OK_MESSAGE}${result.kind}`);
  }

  return result.items;
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the settlement request the directory client sends", () => {
  it("asks our own proxy route and never Нова Пошта directly", async () => {
    const fetchStub = stubUpstream(respondWithItems([SETTLEMENT_ROW]));

    await fetchSettlements(CITY_QUERY, freshSignal());

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(readRequestedUrl(fetchStub).startsWith(SETTLEMENTS_ROUTE)).toBe(
      true
    );
  });

  it("carries the buyer's query under the q parameter the route reads", async () => {
    const fetchStub = stubUpstream(respondWithItems([]));

    await fetchSettlements(CITY_QUERY, freshSignal());

    expect(readRequestedParams(fetchStub).get(QUERY_PARAM)).toBe(CITY_QUERY);
  });

  it("percent-encodes a query rather than letting an ampersand forge a second parameter", async () => {
    const fetchStub = stubUpstream(respondWithItems([]));

    await fetchSettlements(SPECIAL_QUERY, freshSignal());

    expect(readRequestedUrl(fetchStub)).toBe(
      `${SETTLEMENTS_ROUTE}?${QUERY_PARAM}=${ENCODED_SPECIAL_QUERY}`
    );
    expect(readRequestedParams(fetchStub).get(QUERY_PARAM)).toBe(SPECIAL_QUERY);
  });

  it("sends a cyrillic query the route can decode back to what was typed", async () => {
    const fetchStub = stubUpstream(respondWithItems([]));

    await fetchSettlements(CITY_LABEL, freshSignal());

    expect(readRequestedParams(fetchStub).get(QUERY_PARAM)).toBe(CITY_LABEL);
  });

  it("hands fetch a signal the caller's own abort still reaches, so a stale keystroke can be cancelled", async () => {
    const fetchStub = stubUpstream(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error(ABORT_ERROR_MESSAGE);

            error.name = ABORT_ERROR_NAME;

            reject(error);
          });
        })
    );
    const controller = new AbortController();
    const pending = fetchSettlements(CITY_QUERY, controller.signal);

    const [, init] = fetchStub.mock.calls[0];
    const sent = init?.signal;

    if (sent === undefined || sent === null) {
      throw new Error(MISSING_SIGNAL_MESSAGE);
    }

    expect(sent.aborted).toBe(false);

    controller.abort();

    expect(sent.aborted).toBe(true);
    expect((await pending).kind).toBe(ABORTED_KIND);
  });
});

describe("the warehouse request the directory client sends", () => {
  it("names the city ref, the method and the query the route expects", async () => {
    const fetchStub = stubUpstream(respondWithItems([WAREHOUSE_ROW]));

    await fetchWarehouses(
      CITY_REF,
      BRANCH_PARAM,
      WAREHOUSE_QUERY,
      freshSignal()
    );

    const params = readRequestedParams(fetchStub);

    expect(readRequestedUrl(fetchStub)).toBe(
      `${WAREHOUSES_ROUTE}?${CITY_PARAM}=${CITY_REF}&${METHOD_PARAM}=${BRANCH_PARAM}&${QUERY_PARAM}=${WAREHOUSE_QUERY}`
    );
    expect(params.get(CITY_PARAM)).toBe(CITY_REF);
    expect(params.get(METHOD_PARAM)).toBe(BRANCH_PARAM);
    expect(params.get(QUERY_PARAM)).toBe(WAREHOUSE_QUERY);
  });

  it("asks for postomats under the postomat method, which is what makes the two lists differ", async () => {
    const fetchStub = stubUpstream(respondWithItems([]));

    await fetchWarehouses(
      CITY_REF,
      POSTOMAT_PARAM,
      WAREHOUSE_QUERY,
      freshSignal()
    );

    expect(readRequestedParams(fetchStub).get(METHOD_PARAM)).toBe(
      POSTOMAT_PARAM
    );
  });

  it("sends an empty query as an empty parameter, so opening the control lists the first page", async () => {
    const fetchStub = stubUpstream(respondWithItems([WAREHOUSE_ROW]));

    await fetchWarehouses(CITY_REF, BRANCH_PARAM, EMPTY_TEXT, freshSignal());

    expect(readRequestedParams(fetchStub).get(QUERY_PARAM)).toBe(EMPTY_TEXT);
  });

  it("percent-encodes both the ref and the query", async () => {
    const fetchStub = stubUpstream(respondWithItems([]));

    await fetchWarehouses(
      SPECIAL_QUERY,
      BRANCH_PARAM,
      SPECIAL_QUERY,
      freshSignal()
    );

    const params = readRequestedParams(fetchStub);

    expect(readRequestedUrl(fetchStub)).toContain(ENCODED_SPECIAL_QUERY);
    expect(params.get(CITY_PARAM)).toBe(SPECIAL_QUERY);
    expect(params.get(QUERY_PARAM)).toBe(SPECIAL_QUERY);
  });
});

describe("what the directory client makes of a settlement answer", () => {
  it("decodes the minimized rows the proxy sends into settlement choices", async () => {
    stubUpstream(
      respondWithItems([
        SETTLEMENT_ROW,
        {
          ref: SECOND_CITY_REF,
          label: SECOND_CITY_LABEL,
          warehouseCount: NO_WAREHOUSES,
          isCourierAllowed: false,
        },
      ])
    );

    const items = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(SETTLEMENT_ROW);
    expect(items[1]).toEqual({
      ref: SECOND_CITY_REF,
      label: SECOND_CITY_LABEL,
      warehouseCount: NO_WAREHOUSES,
      isCourierAllowed: false,
    });
  });

  it("leaves the region undefined when the directory sent none, rather than inventing an empty one", async () => {
    stubUpstream(respondWithItems([{ ...SETTLEMENT_ROW, region: undefined }]));

    const [first] = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(first?.region).toBeUndefined();
  });

  it("treats an empty region string as no region at all", async () => {
    stubUpstream(respondWithItems([{ ...SETTLEMENT_ROW, region: EMPTY_TEXT }]));

    const [first] = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(first?.region).toBeUndefined();
  });

  it("reads a warehouse count it cannot trust as unknown instead of as zero", async () => {
    stubUpstream(
      respondWithItems([{ ...SETTLEMENT_ROW, warehouseCount: WAREHOUSE_QUERY }])
    );

    const [first] = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(first?.warehouseCount).toBeNull();
  });

  it("allows the courier unless the directory said false outright, because a lost flag must not remove a method", async () => {
    stubUpstream(
      respondWithItems([
        { ...SETTLEMENT_ROW, isCourierAllowed: undefined },
        { ...SETTLEMENT_ROW, ref: SECOND_CITY_REF, isCourierAllowed: false },
      ])
    );

    const items = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(items[0]?.isCourierAllowed).toBe(true);
    expect(items[1]?.isCourierAllowed).toBe(false);
  });

  it("drops a row missing the ref or the label instead of emitting a half-built choice", async () => {
    stubUpstream(
      respondWithItems([
        { label: CITY_LABEL, warehouseCount: KYIV_WAREHOUSE_COUNT },
        { ref: CITY_REF, warehouseCount: KYIV_WAREHOUSE_COUNT },
        { ref: EMPTY_TEXT, label: CITY_LABEL },
        { ref: CITY_REF, label: EMPTY_TEXT },
        SETTLEMENT_ROW,
      ])
    );

    const items = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(items).toEqual([SETTLEMENT_ROW]);
  });

  it("drops rows that are not objects at all", async () => {
    stubUpstream(
      respondWithItems([
        null,
        CITY_LABEL,
        KYIV_WAREHOUSE_COUNT,
        [],
        SETTLEMENT_ROW,
      ])
    );

    const items = expectOk(await fetchSettlements(CITY_QUERY, freshSignal()));

    expect(items).toEqual([SETTLEMENT_ROW]);
  });
});

describe("what the directory client makes of a warehouse answer", () => {
  it("decodes the minimized rows the proxy sends into warehouse choices", async () => {
    stubUpstream(
      respondWithItems([
        WAREHOUSE_ROW,
        {
          number: SECOND_WAREHOUSE_NUMBER,
          label: SECOND_WAREHOUSE_LABEL,
        },
      ])
    );

    const items = expectOk(
      await fetchWarehouses(
        CITY_REF,
        BRANCH_PARAM,
        WAREHOUSE_QUERY,
        freshSignal()
      )
    );

    expect(items).toEqual([
      WAREHOUSE_ROW,
      { number: SECOND_WAREHOUSE_NUMBER, label: SECOND_WAREHOUSE_LABEL },
    ]);
  });

  it("drops a row missing the number or the label instead of emitting a half-built choice", async () => {
    stubUpstream(
      respondWithItems([
        { label: WAREHOUSE_LABEL },
        { number: WAREHOUSE_NUMBER },
        { number: EMPTY_TEXT, label: WAREHOUSE_LABEL },
        { number: WAREHOUSE_NUMBER, label: EMPTY_TEXT },
        WAREHOUSE_ROW,
      ])
    );

    const items = expectOk(
      await fetchWarehouses(
        CITY_REF,
        BRANCH_PARAM,
        WAREHOUSE_QUERY,
        freshSignal()
      )
    );

    expect(items).toEqual([WAREHOUSE_ROW]);
  });

  it("keeps nothing but the number and the label of a row that carries more", async () => {
    stubUpstream(
      respondWithItems([{ ...WAREHOUSE_ROW, schedule: WAREHOUSE_LABEL }])
    );

    const [first] = expectOk(
      await fetchWarehouses(
        CITY_REF,
        BRANCH_PARAM,
        WAREHOUSE_QUERY,
        freshSignal()
      )
    );

    expect(first).toStrictEqual(WAREHOUSE_ROW);
  });
});

describe.each(CALLERS)(
  "$label mapping the answer of the proxy onto a directory result",
  ({ call }) => {
    it("answers ok when the proxy returns rows", async () => {
      stubUpstream(respondWithItems([SETTLEMENT_ROW]));

      expect((await call(freshSignal())).kind).toBe(OK_KIND);
    });

    it("answers ok with an empty list when the proxy found nothing, because a village without a postomat is a fact and not an outage", async () => {
      stubUpstream(respondWithItems([]));

      const result = await call(freshSignal());

      expect(result.kind).toBe(OK_KIND);
      expect(expectOk(result)).toEqual([]);
    });

    it("answers throttled on a 429, so our own limiter never collapses the buyer's form into a fallback", async () => {
      stubUpstream(respondWith({ items: [SETTLEMENT_ROW] }, THROTTLED_STATUS));

      const result = await call(freshSignal());

      expect(result.kind).toBe(THROTTLED_KIND);
      expect(result.kind).not.toBe(DOWN_KIND);
    });

    it.each(DOWN_STATUSES)("answers down on a %i", async (status) => {
      stubUpstream(respondWith({ error: NETWORK_ERROR_MESSAGE }, status));

      expect((await call(freshSignal())).kind).toBe(DOWN_KIND);
    });

    it("answers down when the request never reached the proxy", async () => {
      stubUpstream(() => Promise.reject(new TypeError(NETWORK_ERROR_MESSAGE)));

      expect((await call(freshSignal())).kind).toBe(DOWN_KIND);
    });

    it("answers down when a 200 carries no json at all", async () => {
      stubUpstream(() =>
        Promise.resolve(new Response(HTML_BODY, { status: OK_STATUS }))
      );

      expect((await call(freshSignal())).kind).toBe(DOWN_KIND);
    });

    it.each(MALFORMED_BODIES)(
      "answers down when a 200 carries $label",
      async ({ body }) => {
        stubUpstream(respondWith(body, OK_STATUS));

        expect((await call(freshSignal())).kind).toBe(DOWN_KIND);
      }
    );

    it("answers ok on any other successful status the platform may hand back", async () => {
      stubUpstream(respondWith({ items: [] }, CREATED_STATUS));

      expect((await call(freshSignal())).kind).toBe(OK_KIND);
    });

    it("answers aborted when the caller cancelled the request", async () => {
      stubUpstream((_input, init) => {
        const signal = init?.signal;

        if (signal === undefined || signal === null) {
          return Promise.reject(new Error(MISSING_SIGNAL_MESSAGE));
        }

        return new Promise<Response>((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            reject(signal.reason);
          });
        });
      });

      const controller = new AbortController();
      const pending = call(controller.signal);

      controller.abort();

      expect((await pending).kind).toBe(ABORTED_KIND);
    });

    it("answers aborted for a rejection carrying the abort name, whatever threw it", async () => {
      stubUpstream(() => {
        const error = new Error(ABORT_ERROR_MESSAGE);

        error.name = ABORT_ERROR_NAME;

        return Promise.reject(error);
      });

      expect((await call(freshSignal())).kind).toBe(ABORTED_KIND);
    });

    it("tries a 503 once more before it answers down, because a saturated proxy frees a slot in the meantime", async () => {
      let callCount = 0;
      const fetchStub = stubUpstream(() => {
        callCount += 1;

        return Promise.resolve(
          callCount === FIRST_ATTEMPT
            ? jsonResponse({ error: NETWORK_ERROR_MESSAGE }, UNAVAILABLE_STATUS)
            : jsonResponse({ items: [] }, OK_STATUS)
        );
      });

      const result = await call(freshSignal());

      expect(result.kind).toBe(OK_KIND);
      expect(fetchStub).toHaveBeenCalledTimes(ATTEMPTS_WITH_RETRY);
    });

    it("retries a connection that never landed, and stops after one retry", async () => {
      const fetchStub = stubUpstream(() =>
        Promise.reject(new TypeError(NETWORK_ERROR_MESSAGE))
      );

      const result = await call(freshSignal());

      expect(result.kind).toBe(DOWN_KIND);
      expect(fetchStub).toHaveBeenCalledTimes(ATTEMPTS_WITH_RETRY);
    });

    it("never spends a retry on our own 429, because that would spend the bucket that produced it", async () => {
      const fetchStub = stubUpstream(
        respondWith({ error: NETWORK_ERROR_MESSAGE }, THROTTLED_STATUS)
      );

      await call(freshSignal());

      expect(fetchStub).toHaveBeenCalledTimes(SINGLE_ATTEMPT);
    });

    it("never retries a request the proxy refused as invalid", async () => {
      const fetchStub = stubUpstream(
        respondWith({ error: NETWORK_ERROR_MESSAGE }, BAD_REQUEST_STATUS)
      );

      await call(freshSignal());

      expect(fetchStub).toHaveBeenCalledTimes(SINGLE_ATTEMPT);
    });

    it("answers down on its own deadline when the proxy never answers at all, so the field never spins forever", async () => {
      vi.useFakeTimers();

      stubUpstream(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              const error = new Error(ABORT_ERROR_MESSAGE);

              error.name = ABORT_ERROR_NAME;

              reject(error);
            });
          })
      );

      const pending = call(freshSignal());

      await vi.advanceTimersByTimeAsync(DIRECTORY_DEADLINE_MS);

      expect((await pending).kind).toBe(DOWN_KIND);
    });
  }
);
