const MAX_CONCURRENT_CALLS = 12;
const FAILURE_THRESHOLD = 3;
const DAMPER_COOLDOWN_MS = 30_000;

let activeCalls = 0;
let consecutiveFailures = 0;
let dampedUntil = 0;

const isDamped = (): boolean => Date.now() < dampedUntil;

const isSaturated = (): boolean => activeCalls >= MAX_CONCURRENT_CALLS;

const recordOutcome = (isSuccess: boolean): void => {
  if (isSuccess) {
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
  refused: T,
  isSuccess: (value: T) => boolean
): Promise<T> => {
  if (isDamped() || isSaturated()) {
    return refused;
  }

  activeCalls += 1;

  try {
    const value = await attempt();

    recordOutcome(isSuccess(value));

    return value;
  } finally {
    activeCalls -= 1;
  }
};
