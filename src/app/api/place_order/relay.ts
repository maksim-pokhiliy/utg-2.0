import "server-only";

const RELAY_SECRET_HEADER = "x-relay-secret";
const CONTENT_TYPE_HEADER = "Content-Type";
const JSON_MEDIA_TYPE = "application/json";

const NULL_BODY_STATUSES = [204, 205, 304] as const;
const MIN_FORWARDABLE_STATUS = 200;
const MAX_FORWARDABLE_STATUS = 599;

export const RELAY_REQUEST_TIMEOUT_MS = 20_000;

type NullBodyStatus = (typeof NULL_BODY_STATUSES)[number];

export type BodyStatus = number & { readonly __brand: "BodyStatus" };

export type RelayOutcome =
  | { kind: "empty"; status: NullBodyStatus }
  | { kind: "answered"; status: BodyStatus }
  | { kind: "timed_out" }
  | { kind: "failed" };

const TIMED_OUT = Object.freeze<RelayOutcome>({ kind: "timed_out" });
const FAILED = Object.freeze<RelayOutcome>({ kind: "failed" });

interface ForwardOrderInput {
  relayTarget: string;
  relaySecret: string | undefined;
  payload: unknown;
}

const isNullBodyStatus = (status: number): status is NullBodyStatus =>
  NULL_BODY_STATUSES.some((known) => known === status);

const classifyStatus = (status: number): RelayOutcome => {
  if (isNullBodyStatus(status)) {
    return { kind: "empty", status };
  }

  if (status < MIN_FORWARDABLE_STATUS || status > MAX_FORWARDABLE_STATUS) {
    return FAILED;
  }

  return { kind: "answered", status: status as BodyStatus };
};

const cancelBody = async (response: Response): Promise<void> => {
  try {
    await response.body?.cancel();
  } catch (error) {
    console.error("The order relay body could not be dropped:", error);
  }
};

export const forwardOrder = async ({
  relayTarget,
  relaySecret,
  payload,
}: ForwardOrderInput): Promise<RelayOutcome> => {
  const deadline = AbortSignal.timeout(RELAY_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(relayTarget, {
      method: "POST",
      redirect: "error",
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_MEDIA_TYPE,
        ...(relaySecret ? { [RELAY_SECRET_HEADER]: relaySecret } : {}),
      },
      body: JSON.stringify(payload),
      signal: deadline,
    });

    const outcome = classifyStatus(response.status);

    await cancelBody(response);

    return outcome;
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
