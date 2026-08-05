interface CacheOptions<T> {
  ttlMs: number;
  maxEntries: number;
  isCacheable?: (value: T) => boolean;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface DirectoryCache<T> {
  resolve: (key: string, load: () => Promise<T | null>) => Promise<T | null>;
}

export const createDirectoryCache = <T>(
  options: CacheOptions<T>
): DirectoryCache<T> => {
  const { ttlMs, maxEntries, isCacheable } = options;
  const entries = new Map<string, CacheEntry<T>>();
  const inFlight = new Map<string, Promise<T | null>>();

  const read = (key: string): CacheEntry<T> | null => {
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

  const evictLeastRecentEntries = (): void => {
    for (const key of entries.keys()) {
      if (entries.size <= maxEntries) {
        return;
      }

      entries.delete(key);
    }
  };

  const write = (key: string, value: T): void => {
    if (isCacheable !== undefined && !isCacheable(value)) {
      return;
    }

    entries.delete(key);
    entries.set(key, { value, expiresAt: Date.now() + ttlMs });

    evictLeastRecentEntries();
  };

  const loadEntry = async (
    key: string,
    load: () => Promise<T | null>
  ): Promise<T | null> => {
    const value = await load();

    if (value !== null) {
      write(key, value);
    }

    return value;
  };

  const resolve = async (
    key: string,
    load: () => Promise<T | null>
  ): Promise<T | null> => {
    const cached = read(key);

    if (cached !== null) {
      return cached.value;
    }

    const pending = inFlight.get(key);

    if (pending !== undefined) {
      return pending;
    }

    const loading = loadEntry(key, load);

    inFlight.set(key, loading);

    try {
      return await loading;
    } finally {
      inFlight.delete(key);
    }
  };

  return { resolve };
};
