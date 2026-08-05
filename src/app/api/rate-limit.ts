const ORDER_WINDOW_MS = 60_000;

const ORDER_MAX_REQUESTS = 5;

const DIRECTORY_WINDOW_MS = 60_000;

const DIRECTORY_MAX_REQUESTS = 60;

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

interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimiter {
  consume: (key: string | null) => RateLimitVerdict;
}

const ORDER_RATE_LIMIT: RateLimiterConfig = {
  windowMs: ORDER_WINDOW_MS,
  maxRequests: ORDER_MAX_REQUESTS,
};

const DIRECTORY_RATE_LIMIT: RateLimiterConfig = {
  windowMs: DIRECTORY_WINDOW_MS,
  maxRequests: DIRECTORY_MAX_REQUESTS,
};

const readFirstHop = (headerValue: string): string => {
  const separatorIndex = headerValue.indexOf(FORWARDED_FOR_SEPARATOR);

  return separatorIndex === -1
    ? headerValue
    : headerValue.slice(0, separatorIndex);
};

const readRecentHits = (
  timestamps: number[],
  now: number,
  windowMs: number
): number[] =>
  timestamps.filter(
    (timestamp) => timestamp > now - windowMs && timestamp <= now
  );

const sweepStaleClients = (
  hits: Map<string, number[]>,
  now: number,
  windowMs: number
): void => {
  for (const [clientKey, timestamps] of hits) {
    const recentHits = readRecentHits(timestamps, now, windowMs);

    if (recentHits.length === 0) {
      hits.delete(clientKey);

      continue;
    }

    hits.set(clientKey, recentHits);
  }
};

const evictLeastRecentClients = (hits: Map<string, number[]>): void => {
  for (const clientKey of hits.keys()) {
    if (hits.size <= RATE_LIMIT_RETAINED_CLIENTS) {
      return;
    }

    hits.delete(clientKey);
  }
};

const toRetryAfterSeconds = (
  oldestHit: number,
  now: number,
  windowMs: number
): number => {
  const remainingMs = oldestHit + windowMs - now;

  return Math.max(
    Math.ceil(remainingMs / MS_PER_SECOND),
    MIN_RETRY_AFTER_SECONDS
  );
};

const consume = (
  hits: Map<string, number[]>,
  config: RateLimiterConfig,
  key: string | null
): RateLimitVerdict => {
  if (key === null) {
    return { isAllowed: true };
  }

  const now = Date.now();
  const recentHits = readRecentHits(hits.get(key) ?? [], now, config.windowMs);
  const isAllowed = recentHits.length < config.maxRequests;

  hits.delete(key);
  hits.set(key, isAllowed ? [...recentHits, now] : recentHits);

  if (hits.size > RATE_LIMIT_MAX_CLIENTS) {
    sweepStaleClients(hits, now, config.windowMs);
    evictLeastRecentClients(hits);
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
    retryAfterSeconds: toRetryAfterSeconds(oldestHit, now, config.windowMs),
  };
};

const createRateLimiter = (config: RateLimiterConfig): RateLimiter => {
  const hits = new Map<string, number[]>();

  return { consume: (key) => consume(hits, config, key) };
};

const orderLimiter = createRateLimiter(ORDER_RATE_LIMIT);

const directoryLimiter = createRateLimiter(DIRECTORY_RATE_LIMIT);

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

export const consumeRateLimit = (key: string | null): RateLimitVerdict =>
  orderLimiter.consume(key);

export const consumeDirectoryRateLimit = (
  key: string | null
): RateLimitVerdict => directoryLimiter.consume(key);
