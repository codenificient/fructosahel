import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCachedData,
  cacheData,
  type CachedData,
} from "@/lib/utils/offline-storage";

export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isOffline: boolean;
  isCached: boolean;
  cachedAt: Date | null;
}

export interface UseFetchOptions {
  /**
   * Cache key for offline storage
   * If provided, data will be cached in IndexedDB
   */
  cacheKey?: string;
  /**
   * Cache type for organizing cached data
   */
  cacheType?: CachedData["type"];
  /**
   * Time-to-live for cached data in milliseconds
   * Defaults to 5 minutes
   */
  cacheTtl?: number;
  /**
   * Whether to use cached data while fetching
   * Defaults to true
   */
  staleWhileRevalidate?: boolean;
  /**
   * Skip fetching and use only cached data
   * Useful when offline
   */
  offlineOnly?: boolean;
}

export function useFetch<T>(
  url: string | null,
  options?: UseFetchOptions,
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);

  const {
    cacheKey,
    cacheType,
    cacheTtl = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = true,
    offlineOnly = false,
  } = options || {};

  // Track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load cached data first if available
  const loadCachedData = useCallback(async () => {
    if (!cacheKey || !cacheType) return null;

    try {
      const cached = await getCachedData<T>(cacheKey);
      if (cached && isMounted.current) {
        setData(cached.data);
        setIsCached(true);
        setCachedAt(new Date(cached.updatedAt));
        return cached.data;
      }
    } catch (err) {
      console.error("[useFetch] Error loading cached data:", err);
    }
    return null;
  }, [cacheKey, cacheType]);

  // Save data to cache
  const saveToCache = useCallback(
    async (fetchedData: T) => {
      if (!cacheKey || !cacheType) return;

      try {
        await cacheData(cacheKey, cacheType, fetchedData, cacheTtl);
      } catch (err) {
        console.error("[useFetch] Error saving to cache:", err);
      }
    },
    [cacheKey, cacheType, cacheTtl],
  );

  const fetchData = useCallback(async () => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    // Load cached data first for stale-while-revalidate
    if (staleWhileRevalidate && cacheKey) {
      const cached = await loadCachedData();
      if (cached) {
        setIsLoading(false);
      }
    }

    // If offline-only mode, don't make network request
    if (offlineOnly) {
      await loadCachedData();
      setIsLoading(false);
      setIsOffline(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);

      const response = await fetch(url);

      // Check for offline indicator in response
      const responseData = await response.json();

      if (responseData._offline) {
        // Data came from service worker cache
        if (isMounted.current) {
          setIsOffline(true);
          setIsCached(true);
          if (responseData._cachedAt) {
            setCachedAt(new Date(parseInt(responseData._cachedAt, 10)));
          }
          // Remove offline metadata from data
          const { _offline, _cachedAt, ...cleanData } = responseData;
          setData(cleanData as T);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP error! status: ${response.status}`,
        );
      }

      if (isMounted.current) {
        setData(responseData);
        setIsCached(false);
        setCachedAt(null);

        // Cache the successful response
        await saveToCache(responseData);
      }
    } catch (err) {
      // Network error - try to use cached data
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setIsOffline(true);
        const cached = await loadCachedData();
        if (cached) {
          if (isMounted.current) {
            setIsLoading(false);
          }
          return;
        }
      }

      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [
    url,
    loadCachedData,
    saveToCache,
    staleWhileRevalidate,
    offlineOnly,
    cacheKey,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        fetchData();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOffline, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    isOffline,
    isCached,
    cachedAt,
  };
}
