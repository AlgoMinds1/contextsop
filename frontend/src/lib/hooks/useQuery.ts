"use client";

import { useState, useEffect, useCallback } from "react";

// In-memory cache map to hold stale queries
const memoryCache: Record<string, unknown> = {};

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  mutate: (newData?: T) => Promise<void>;
}

/**
 * Lightweight, zero-dependency Stale-While-Revalidate (SWR) hook.
 * Returns cached data immediately to prevent layout shifts, then fetches fresh data in the background.
 */
export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { enabled?: boolean },
): UseQueryResult<T> {
  const isEnabled = options?.enabled !== false;
  const cached = memoryCache[key] as T | undefined;

  const [data, setData] = useState<T | null>(cached || null);
  const [loading, setLoading] = useState<boolean>(!cached && isEnabled);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (newData?: T) => {
      if (newData !== undefined) {
        memoryCache[key] = newData;
        setData(newData);
        return;
      }
      try {
        const freshData = await fetcher();
        memoryCache[key] = freshData;
        setData(freshData);
        setError(null);
      } catch (err) {
        console.error(`Error revalidating key [${key}]:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [key, fetcher],
  );

  useEffect(() => {
    if (isEnabled) {
      mutate();
    }
  }, [key, isEnabled, mutate]);

  return {
    data,
    loading,
    error,
    mutate,
  };
}
