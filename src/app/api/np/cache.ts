interface CacheOptions<T> {
  ttlMs: number;
  maxEntries: number;
  negativeTtlMs?: number;
  isCacheable?: (value: T) => boolean;
}

interface CacheEntry<T> {
  value: T | null;
  expiresAt: number;
}

type CacheEntries<T> = Map<string, CacheEntry<T>>;

type CacheLoader<T> = () => Promise<T | null>;

export interface DirectoryCache<T> {
  resolve: (key: string, load: CacheLoader<T>) => Promise<T | null>;
}

const readEntry = <T>(
  entries: CacheEntries<T>,
  key: string
): CacheEntry<T> | null => {
  const entry = entries.get(key);

  if (entry === undefined) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    entries.delete(key);

    return null;
  }

  entries.delete(key);
  entries.set(key, entry);

  return entry;
};

const evictLeastRecentEntries = <T>(
  entries: CacheEntries<T>,
  maxEntries: number
): void => {
  for (const key of entries.keys()) {
    if (entries.size <= maxEntries) {
      return;
    }

    entries.delete(key);
  }
};

const writeEntry = <T>(
  entries: CacheEntries<T>,
  maxEntries: number,
  key: string,
  entry: CacheEntry<T>
): void => {
  entries.delete(key);
  entries.set(key, entry);

  evictLeastRecentEntries(entries, maxEntries);
};

const runSingleFlight = async <T>(
  inFlight: Map<string, Promise<T | null>>,
  key: string,
  load: CacheLoader<T>
): Promise<T | null> => {
  const pending = inFlight.get(key);

  if (pending !== undefined) {
    return pending;
  }

  const loading = load();

  inFlight.set(key, loading);

  try {
    return await loading;
  } finally {
    inFlight.delete(key);
  }
};

export const createDirectoryCache = <T>(
  options: CacheOptions<T>
): DirectoryCache<T> => {
  const { ttlMs, maxEntries, negativeTtlMs, isCacheable } = options;
  const entries: CacheEntries<T> = new Map();
  const inFlight = new Map<string, Promise<T | null>>();

  const resolveTtlMs = (value: T | null): number | null => {
    if (value === null) {
      return negativeTtlMs ?? null;
    }

    return isCacheable === undefined || isCacheable(value) ? ttlMs : null;
  };

  const store = (key: string, value: T | null): void => {
    const entryTtlMs = resolveTtlMs(value);

    if (entryTtlMs === null) {
      return;
    }

    writeEntry(entries, maxEntries, key, {
      value,
      expiresAt: Date.now() + entryTtlMs,
    });
  };

  const resolve = async (
    key: string,
    load: CacheLoader<T>
  ): Promise<T | null> => {
    const cached = readEntry(entries, key);

    if (cached !== null) {
      return cached.value;
    }

    return runSingleFlight(inFlight, key, async () => {
      const value = await load();

      store(key, value);

      return value;
    });
  };

  return { resolve };
};
