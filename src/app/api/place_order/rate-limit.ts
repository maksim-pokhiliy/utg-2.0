const RATE_LIMIT_WINDOW_MS = 60_000;

const RATE_LIMIT_MAX_REQUESTS = 5;

const RATE_LIMIT_MAX_CLIENTS = 1000;

const RATE_LIMIT_RETAINED_CLIENTS = 750;

const MAX_CLIENT_KEY_LENGTH = 45;

const FORWARDED_FOR_HEADER = "x-forwarded-for";

const REAL_IP_HEADER = "x-real-ip";

const FORWARDED_FOR_SEPARATOR = ",";

const MS_PER_SECOND = 1000;

const MIN_RETRY_AFTER_SECONDS = 1;

export type RateLimitVerdict =
  | { isAllowed: true }
  | { isAllowed: false; retryAfterSeconds: number };

const hits = new Map<string, number[]>();

const readFirstHop = (headerValue: string): string => {
  const separatorIndex = headerValue.indexOf(FORWARDED_FOR_SEPARATOR);

  return separatorIndex === -1
    ? headerValue
    : headerValue.slice(0, separatorIndex);
};

const readRecentHits = (timestamps: number[], now: number): number[] =>
  timestamps.filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS && timestamp <= now
  );

const sweepStaleClients = (now: number): void => {
  for (const [clientKey, timestamps] of hits) {
    const recentHits = readRecentHits(timestamps, now);

    if (recentHits.length === 0) {
      hits.delete(clientKey);

      continue;
    }

    hits.set(clientKey, recentHits);
  }
};

const evictLeastRecentClients = (): void => {
  for (const clientKey of hits.keys()) {
    if (hits.size <= RATE_LIMIT_RETAINED_CLIENTS) {
      return;
    }

    hits.delete(clientKey);
  }
};

const toRetryAfterSeconds = (oldestHit: number, now: number): number => {
  const remainingMs = oldestHit + RATE_LIMIT_WINDOW_MS - now;

  return Math.max(
    Math.ceil(remainingMs / MS_PER_SECOND),
    MIN_RETRY_AFTER_SECONDS
  );
};

export const resolveClientKey = (request: Request): string | null => {
  const forwardedFor = request.headers.get(FORWARDED_FOR_HEADER);
  const firstHop =
    forwardedFor === null ? "" : readFirstHop(forwardedFor).trim();

  if (firstHop !== "") {
    return firstHop.slice(0, MAX_CLIENT_KEY_LENGTH);
  }

  const realIp = request.headers.get(REAL_IP_HEADER)?.trim() ?? "";

  return realIp === "" ? null : realIp.slice(0, MAX_CLIENT_KEY_LENGTH);
};

export const consumeRateLimit = (key: string | null): RateLimitVerdict => {
  if (key === null) {
    return { isAllowed: true };
  }

  const now = Date.now();
  const recentHits = readRecentHits(hits.get(key) ?? [], now);
  const isAllowed = recentHits.length < RATE_LIMIT_MAX_REQUESTS;

  hits.delete(key);
  hits.set(key, isAllowed ? [...recentHits, now] : recentHits);

  if (hits.size > RATE_LIMIT_MAX_CLIENTS) {
    sweepStaleClients(now);
    evictLeastRecentClients();
  }

  if (isAllowed) {
    return { isAllowed: true };
  }

  const oldestHit = recentHits.reduce(
    (oldest, timestamp) => Math.min(oldest, timestamp),
    now
  );

  return {
    isAllowed: false,
    retryAfterSeconds: toRetryAfterSeconds(oldestHit, now),
  };
};
