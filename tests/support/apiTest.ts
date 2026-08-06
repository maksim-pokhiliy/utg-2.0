import { expect, vi } from "vitest";
import type { Mock } from "vitest";

const CONTENT_TYPE_HEADER = "Content-Type";
const JSON_CONTENT_TYPE = "application/json";
const RESPONSE_JSON_HEADERS = { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE };

export type FetchStub = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const jsonResponse = (payload: unknown, status: number): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: RESPONSE_JSON_HEADERS,
  });

export const stubUpstream = (respond: FetchStub): Mock<FetchStub> => {
  const fetchStub = vi.fn<FetchStub>(respond);

  vi.stubGlobal("fetch", fetchStub);

  return fetchStub;
};

export const expectUpstreamOnly = (
  calls: readonly Parameters<FetchStub>[],
  upstreamUrl: string
): void => {
  for (const [input] of calls) {
    expect(input).toBe(upstreamUrl);
  }
};
