import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

interface CachedQueryData<T> {
  data: T;
  savedAt: number;
}

function readCache<T>(cacheKey: string): CachedQueryData<T> | null {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey) ?? "null") as CachedQueryData<T> | null;
    return value?.data && typeof value.savedAt === "number" ? value : null;
  } catch {
    return null;
  }
}

export function useResilientTVQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
  refreshInterval: number,
) {
  const cacheKey = `pgknma-tv-cache-${name}-v1`;
  const cached = useMemo(() => readCache<T>(cacheKey), [cacheKey]);
  const query = useQuery<T, Error>({
    queryKey: ["tv", name],
    queryFn,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.savedAt,
    staleTime: Math.min(refreshInterval, 30_000),
    retry: 4,
    retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 30_000),
    refetchInterval: ({ state }) => state.status === "error" ? 15_000 : refreshInterval,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (query.data === undefined || query.isError) return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data: query.data, savedAt: Date.now() }));
    } catch {
      // A full or unavailable storage must never block the TV screen.
    }
  }, [cacheKey, query.data, query.isError]);

  return {
    ...query,
    hasCachedData: Boolean(cached && query.data !== undefined),
  };
}
