import "server-only";

const RELAY_PATH = "/place_order";
const RELAY_SECRET_HEADER = "x-relay-secret";
const RELAY_REQUEST_TIMEOUT_MS = 20_000;
const MAX_RELAY_BODY_BYTES = 65_536;
const JSON_MEDIA_TYPE = "application/json";
const CONTENT_TYPE_HEADER = "Content-Type";
const MEDIA_TYPE_SEPARATOR = ";";
const SUBSTITUTE_BODY = "{}";
const NO_CONTENT_STATUS = 204;
const RESET_CONTENT_STATUS = 205;
const NOT_MODIFIED_STATUS = 304;

export type RelayOutcome =
  | { kind: "answered"; status: number; body: string | null }
  | { kind: "timed_out" }
  | { kind: "failed" };

const TIMED_OUT = Object.freeze<RelayOutcome>({ kind: "timed_out" });
const FAILED = Object.freeze<RelayOutcome>({ kind: "failed" });

interface ForwardOrderInput {
  relayOrigin: string;
  relaySecret: string | undefined;
  payload: unknown;
}

const isNullBodyStatus = (status: number): boolean =>
  status === NO_CONTENT_STATUS ||
  status === RESET_CONTENT_STATUS ||
  status === NOT_MODIFIED_STATUS;

const isJsonContentType = (contentType: string | null): boolean => {
  if (contentType === null) {
    return false;
  }

  const [essence] = contentType.split(MEDIA_TYPE_SEPARATOR);

  return essence.trim().toLowerCase() === JSON_MEDIA_TYPE;
};

const readCappedText = async (response: Response): Promise<string | null> => {
  const stream = response.body;

  if (stream === null) {
    return null;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let text = "";
  let size = 0;

  for (;;) {
    const chunk = await reader.read();

    if (chunk.done) {
      return text + decoder.decode();
    }

    size += chunk.value.byteLength;

    if (size > MAX_RELAY_BODY_BYTES) {
      await reader.cancel();

      return null;
    }

    text += decoder.decode(chunk.value, { stream: true });
  }
};

const readAnsweredBody = async (response: Response): Promise<string | null> => {
  if (isNullBodyStatus(response.status)) {
    await response.body?.cancel();

    return null;
  }

  if (!isJsonContentType(response.headers.get(CONTENT_TYPE_HEADER))) {
    await response.body?.cancel();

    return SUBSTITUTE_BODY;
  }

  return (await readCappedText(response)) ?? SUBSTITUTE_BODY;
};

export const forwardOrder = async ({
  relayOrigin,
  relaySecret,
  payload,
}: ForwardOrderInput): Promise<RelayOutcome> => {
  const deadline = AbortSignal.timeout(RELAY_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${relayOrigin}${RELAY_PATH}`, {
      method: "POST",
      redirect: "error",
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_MEDIA_TYPE,
        ...(relaySecret ? { [RELAY_SECRET_HEADER]: relaySecret } : {}),
      },
      body: JSON.stringify(payload),
      signal: deadline,
    });

    return {
      kind: "answered",
      status: response.status,
      body: await readAnsweredBody(response),
    };
  } catch (error) {
    if (deadline.aborted) {
      console.error(
        "The order relay did not answer within the deadline:",
        error
      );

      return TIMED_OUT;
    }

    console.error("Error placing order:", error);

    return FAILED;
  }
};
