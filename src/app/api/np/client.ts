const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_MODEL_NAME = "Address";
const NP_REQUEST_TIMEOUT_MS = 2500;

type NpMethod = "searchSettlements" | "getWarehouses";

export type NpResult =
  | { isSuccess: true; rows: readonly unknown[] }
  | { isSuccess: false };

const NP_FAILURE = Object.freeze<NpResult>({ isSuccess: false });

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const readString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const callNpDirectory = async (
  calledMethod: NpMethod,
  methodProperties: Record<string, string>,
  signal?: AbortSignal
): Promise<NpResult> => {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;

  if (!apiKey) {
    return NP_FAILURE;
  }

  try {
    const response = await fetch(NP_API_URL, {
      method: "POST",
      cache: "no-store",
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
      return NP_FAILURE;
    }

    const payload: unknown = await response.json();

    if (
      !isRecord(payload) ||
      payload.success !== true ||
      !Array.isArray(payload.data)
    ) {
      return NP_FAILURE;
    }

    return { isSuccess: true, rows: payload.data };
  } catch (error) {
    console.error("Failed to reach the delivery directory:", error);

    return NP_FAILURE;
  }
};
