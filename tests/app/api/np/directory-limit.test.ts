import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { NextRequest } from "next/server";

import type { FetchStub } from "../../../support/apiTest";
import { stubUpstream } from "../../../support/apiTest";

const NP_API_KEY_NAME = "NOVA_POSHTA_API_KEY";

const SETTLEMENTS_URL = "https://example.test/api/np/settlements";
const WAREHOUSES_URL = "https://example.test/api/np/warehouses";

const FORWARDED_FOR_HEADER = "x-forwarded-for";
const CLIENT_IP = "203.0.113.21";
const OTHER_CLIENT_IP = "203.0.113.22";
const ANONYMOUS_CLIENT = null;

const QUERY_PARAM = "q";
const CITY_PARAM = "city";
const METHOD_PARAM = "method";

const KYIV_QUERY = "київ";
const BLANK_QUERY = "";
const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const BRANCH_METHOD = "branch";

const DIRECTORY_MAX_REQUESTS = 60;
const FAIL_OPEN_ATTEMPT_COUNT = DIRECTORY_MAX_REQUESTS + 1;

const OK_STATUS = 200;
const TOO_MANY_REQUESTS_STATUS = 429;
const BAD_GATEWAY_STATUS = 502;
const UNAVAILABLE_STATUS = 503;

const TOO_MANY_REQUESTS_BODY = '{"error":"Too many requests"}';
const EMPTY_ITEMS_BODY = '{"items":[]}';
const UNAVAILABLE_BODY = '{"error":"Directory service is unavailable"}';

const loadSettlementsRoute = () => import("@root/app/api/np/settlements/route");

const loadWarehousesRoute = () => import("@root/app/api/np/warehouses/route");

const buildClientHeaders = (clientIp: string | null): Record<string, string> =>
  clientIp === null ? {} : { [FORWARDED_FOR_HEADER]: clientIp };

const buildSettlementsRequest = (
  query: string,
  clientIp: string | null
): NextRequest =>
  new NextRequest(
    `${SETTLEMENTS_URL}?${new URLSearchParams({
      [QUERY_PARAM]: query,
    }).toString()}`,
    { headers: buildClientHeaders(clientIp) }
  );

const buildWarehousesRequest = (clientIp: string | null): NextRequest =>
  new NextRequest(
    `${WAREHOUSES_URL}?${new URLSearchParams({
      [CITY_PARAM]: CITY_REF,
      [METHOD_PARAM]: BRANCH_METHOD,
    }).toString()}`,
    { headers: buildClientHeaders(clientIp) }
  );

const stubUnreachableUpstream = (): Mock<FetchStub> =>
  stubUpstream(() =>
    Promise.resolve(new Response(null, { status: BAD_GATEWAY_STATUS }))
  );

const readStatuses = (responses: readonly Response[]): number[] =>
  responses.map((response) => response.status);

const readLast = (responses: readonly Response[]): Response =>
  responses[responses.length - 1];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv(NP_API_KEY_NAME, undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the np directory limiter budget", () => {
  it("blocks a warehouses lookup once settlements has spent the shared budget", async () => {
    const fetchStub = stubUnreachableUpstream();
    const settlements = await loadSettlementsRoute();
    const warehouses = await loadWarehousesRoute();

    const spent: Response[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      spent.push(
        await settlements.GET(buildSettlementsRequest(BLANK_QUERY, CLIENT_IP))
      );
    }

    const blocked = await warehouses.GET(buildWarehousesRequest(CLIENT_IP));
    const stranger = await warehouses.GET(
      buildWarehousesRequest(OTHER_CLIENT_IP)
    );

    expect(readStatuses(spent)).toEqual(
      Array(DIRECTORY_MAX_REQUESTS).fill(OK_STATUS)
    );
    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);
    expect(stranger.status).toBe(UNAVAILABLE_STATUS);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("blocks a settlements lookup once warehouses has spent the shared budget", async () => {
    const fetchStub = stubUnreachableUpstream();
    const settlements = await loadSettlementsRoute();
    const warehouses = await loadWarehousesRoute();

    const spent: Response[] = [];

    for (let attempt = 0; attempt < DIRECTORY_MAX_REQUESTS; attempt += 1) {
      spent.push(await warehouses.GET(buildWarehousesRequest(CLIENT_IP)));
    }

    const blocked = await settlements.GET(
      buildSettlementsRequest(BLANK_QUERY, CLIENT_IP)
    );
    const stranger = await settlements.GET(
      buildSettlementsRequest(BLANK_QUERY, OTHER_CLIENT_IP)
    );

    expect(readStatuses(spent)).toEqual(
      Array(DIRECTORY_MAX_REQUESTS).fill(UNAVAILABLE_STATUS)
    );
    expect(blocked.status).toBe(TOO_MANY_REQUESTS_STATUS);
    expect(await blocked.text()).toBe(TOO_MANY_REQUESTS_BODY);
    expect(stranger.status).toBe(OK_STATUS);
    expect(await stranger.text()).toBe(EMPTY_ITEMS_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("never blocks a warehouses lookup that carries no client identity", async () => {
    const fetchStub = stubUnreachableUpstream();
    const { GET } = await loadWarehousesRoute();

    const served: Response[] = [];

    for (let attempt = 0; attempt < FAIL_OPEN_ATTEMPT_COUNT; attempt += 1) {
      served.push(await GET(buildWarehousesRequest(ANONYMOUS_CLIENT)));
    }

    expect(readStatuses(served)).toEqual(
      Array(FAIL_OPEN_ATTEMPT_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(await readLast(served).text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("never blocks a settlements lookup that carries no client identity", async () => {
    const fetchStub = stubUnreachableUpstream();
    const { GET } = await loadSettlementsRoute();

    const served: Response[] = [];

    for (let attempt = 0; attempt < FAIL_OPEN_ATTEMPT_COUNT; attempt += 1) {
      served.push(
        await GET(buildSettlementsRequest(KYIV_QUERY, ANONYMOUS_CLIENT))
      );
    }

    expect(readStatuses(served)).toEqual(
      Array(FAIL_OPEN_ATTEMPT_COUNT).fill(UNAVAILABLE_STATUS)
    );
    expect(await readLast(served).text()).toBe(UNAVAILABLE_BODY);
    expect(fetchStub).not.toHaveBeenCalled();
  });
});
