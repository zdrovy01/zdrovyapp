"use client";

import { useEffect, useRef, useState } from "react";

// Session-scoped in-memory cache. Persists across client-side navigations
// (until a full reload), so re-opening a page shows data instantly and then
// revalidates in the background.
const store = new Map<string, unknown>();

export function cacheGet<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}
export function cacheSet<T>(key: string, value: T): void {
  store.set(key, value);
}

/**
 * Loads data with a cache-first strategy.
 * - If cached, returns it immediately (loading = false) and revalidates in background.
 * - If not cached, shows loading until the first fetch resolves.
 *
 * Returns `data`, `loading`, and `setData` (which also updates the cache — use it
 * for optimistic mutations like delete/unsave).
 */
export function useCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  initial: T
) {
  const cached = cacheGet<T>(key);
  const [data, setDataState] = useState<T>(cached ?? initial);
  const [loading, setLoading] = useState(cached === undefined);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let alive = true;
    fetcherRef
      .current()
      .then((res) => {
        cacheSet(key, res);
        if (alive) setDataState(res);
      })
      .catch((err) => {
        console.error("useCached fetch failed:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [key]);

  const setData = (next: T) => {
    cacheSet(key, next);
    setDataState(next);
  };

  return { data, loading, setData };
}
