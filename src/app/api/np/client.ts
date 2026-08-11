import "server-only";

import { stripInvisibles } from "@root/utils/invisibles";

import { guardCarrierCall, type CarrierVerdict } from "./guard";
import { CARRIER_REFUSED, type CarrierRefused } from "./refusal";

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_MODEL_NAME = "Address";
const NP_REQUEST_TIMEOUT_MS = 2500;
const MAX_LABEL_LENGTH = 256;
const MAX_IDENTIFIER_LENGTH = 64;
const THROTTLE_ERROR_CODE = "20000401501";
const THROTTLE_ERROR_TEXT = "to many requests";

type NpMethod = "searchSettlements" | "getWarehouses";

export type NpResult =
  | { kind: "rows"; rows: readonly unknown[] }
  | { kind: "distress" }
  | { kind: "rejected" };

const NP_DISTRESS = Object.freeze<NpResult>({ kind: "distress" });
const NP_REJECTED = Object.freeze<NpResult>({ kind: "rejected" });

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const readString = (value: unknown): string =>
  typeof value === "string" ? stripInvisibles(value).trim() : "";

export const capLabel = (text: string): string =>
  text.slice(0, MAX_LABEL_LENGTH);

export const capIdentifier = (text: string): string =>
  text.slice(0, MAX_IDENTIFIER_LENGTH);

const readCode = (value: unknown): string =>
  typeof value === "number" ? String(value) : readString(value);

const readList = (value: unknown): readonly unknown[] =>
  Array.isArray(value) ? value : [];

const isThrottleEnvelope = (payload: Record<string, unknown>): boolean =>
  readList(payload.errorCodes).some(
    (code) => readCode(code) === THROTTLE_ERROR_CODE
  ) ||
  readList(payload.errors).some(
    (error) => readString(error).toLowerCase() === THROTTLE_ERROR_TEXT
  );

const classifyResult = (result: NpResult): CarrierVerdict =>
  result.kind === "distress" ? "distress" : "answered";

const fetchDirectory = async (
  apiKey: string,
  calledMethod: NpMethod,
  methodProperties: Record<string, string>,
  signal?: AbortSignal
): Promise<NpResult> => {
  try {
    const response = await fetch(NP_API_URL, {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: NP_MODEL_NAME,
        calledMethod,
        methodProperties,
      }),
      signal: signal ?? AbortSignal.timeout(NP_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return NP_DISTRESS;
    }

    const payload: unknown = await response.json();

    if (!isRecord(payload)) {
      return NP_DISTRESS;
    }

    if (payload.success !== true) {
      return isThrottleEnvelope(payload) ? NP_DISTRESS : NP_REJECTED;
    }

    if (!Array.isArray(payload.data)) {
      return NP_DISTRESS;
    }

    return { kind: "rows", rows: payload.data };
  } catch (error) {
    console.error("Failed to reach the delivery directory:", error);

    return NP_DISTRESS;
  }
};

export const callNpDirectory = async (
  calledMethod: NpMethod,
  methodProperties: Record<string, string>,
  signal?: AbortSignal
): Promise<NpResult | CarrierRefused> => {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;

  if (!apiKey) {
    return CARRIER_REFUSED;
  }

  return guardCarrierCall(
    () => fetchDirectory(apiKey, calledMethod, methodProperties, signal),
    classifyResult
  );
};
