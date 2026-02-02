"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/**
 * Subscription callback type
 */
type Subscriber<T> = (data: T | null) => void;

/**
 * Simple in-memory data store for sharing state between hooks
 */
class DataStore<T> {
  private data: T | null = null;
  private subscribers: Set<Subscriber<T>> = new Set();
  private fetchPromise: Promise<T> | null = null;

  getData(): T | null {
    return this.data;
  }

  setData(data: T | null): void {
    this.data = data;
    this.notifySubscribers();
  }

  subscribe(callback: Subscriber<T>): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.data));
  }

  setFetchPromise(promise: Promise<T> | null): void {
    this.fetchPromise = promise;
  }

  getFetchPromise(): Promise<T> | null {
    return this.fetchPromise;
  }
}

// Global store registry
const storeRegistry = new Map<string, DataStore<any>>();

function getStore<T>(key: string): DataStore<T> {
  if (!storeRegistry.has(key)) {
    storeRegistry.set(key, new DataStore<T>());
  }
  return storeRegistry.get(key) as DataStore<T>;
}

/**
 * Clear a specific store (useful for testing or logout)
 */
export function clearStore(key: string): void {
  if (storeRegistry.has(key)) {
    storeRegistry.get(key)!.setData(null);
  }
}

/**
 * Clear all stores
 */
export function clearAllStores(): void {
  storeRegistry.forEach((store) => store.setData(null));
}

/**
 * State returned by the data store hook
 */
export interface DataStoreState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
  getCurrentData: () => T | null;
}

/**
 * Hook for fetching and managing data with a shared store
 */
export function useDataStore<T>(
  key: string,
  url: string | null,
): DataStoreState<T> {
  const store = useMemo(() => getStore<T>(key), [key]);
  const [data, setLocalData] = useState<T | null>(store.getData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  // Subscribe to store changes
  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = store.subscribe((newData) => {
      if (mountedRef.current) {
        setLocalData(newData);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [store]);

  const fetchData = useCallback(async () => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (mountedRef.current) {
        store.setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [url, store]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setData = useCallback(
    (newData: T | null) => {
      store.setData(newData);
    },
    [store],
  );

  const getCurrentData = useCallback(() => {
    return store.getData();
  }, [store]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
    getCurrentData,
  };
}

/**
 * Hook for accessing a data store without fetching
 * Useful for mutation hooks that need to update the store
 */
export function useDataStoreAccess<T>(key: string): {
  setData: (data: T | null) => void;
  getCurrentData: () => T | null;
} {
  const store = useMemo(() => getStore<T>(key), [key]);

  const setData = useCallback(
    (newData: T | null) => {
      store.setData(newData);
    },
    [store],
  );

  const getCurrentData = useCallback(() => {
    return store.getData();
  }, [store]);

  return { setData, getCurrentData };
}
