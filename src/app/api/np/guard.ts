import { CARRIER_REFUSED, type CarrierRefused } from "./refusal";

const MAX_CONCURRENT_CALLS = 12;
const FAILURE_THRESHOLD = 3;
const DAMPER_COOLDOWN_MS = 30_000;

export type CarrierVerdict = "answered" | "distress";

let activeCalls = 0;
let consecutiveFailures = 0;
let dampedUntil = 0;

const isDamped = (): boolean => Date.now() < dampedUntil;

const isSaturated = (): boolean => activeCalls >= MAX_CONCURRENT_CALLS;

const recordOutcome = (verdict: CarrierVerdict): void => {
  if (verdict === "answered") {
    consecutiveFailures = 0;
    dampedUntil = 0;

    return;
  }

  consecutiveFailures += 1;

  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    consecutiveFailures = 0;
    dampedUntil = Date.now() + DAMPER_COOLDOWN_MS;
  }
};

export const guardCarrierCall = async <T>(
  attempt: () => Promise<T>,
  classify: (value: T) => CarrierVerdict
): Promise<T | CarrierRefused> => {
  if (isDamped() || isSaturated()) {
    return CARRIER_REFUSED;
  }

  activeCalls += 1;

  try {
    const value = await attempt();

    recordOutcome(classify(value));

    return value;
  } finally {
    activeCalls -= 1;
  }
};
