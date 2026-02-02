/**
 * Offline Storage Utility using IndexedDB
 * Provides persistent storage for offline data and mutation queuing
 */

const DB_NAME = "fructosahel-offline";
const DB_VERSION = 1;

// Store names
const STORES = {
  CACHE: "cache",
  MUTATIONS: "mutations",
} as const;

// Types for offline storage
export interface CachedData<T = unknown> {
  key: string;
  type:
    | "farms"
    | "fields"
    | "crops"
    | "tasks"
    | "transactions"
    | "sales"
    | "users";
  data: T;
  updatedAt: number;
  expiresAt?: number;
}

export interface QueuedMutation {
  id: string;
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  type: "create" | "update" | "delete";
  entityType: string;
  entityId?: string;
  createdAt: number;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

// Database instance
let dbInstance: IDBDatabase | null = null;

/**
 * Open or get the IndexedDB database
 */
export async function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[OfflineStorage] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection close
      dbInstance.onclose = () => {
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create cache store
      if (!db.objectStoreNames.contains(STORES.CACHE)) {
        const cacheStore = db.createObjectStore(STORES.CACHE, {
          keyPath: "key",
        });
        cacheStore.createIndex("type", "type", { unique: false });
        cacheStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Create mutations store
      if (!db.objectStoreNames.contains(STORES.MUTATIONS)) {
        const mutationsStore = db.createObjectStore(STORES.MUTATIONS, {
          keyPath: "id",
        });
        mutationsStore.createIndex("createdAt", "createdAt", { unique: false });
        mutationsStore.createIndex("entityType", "entityType", {
          unique: false,
        });
      }
    };
  });
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ============================================================================
// Cache Operations
// ============================================================================

/**
 * Store data in the cache
 */
export async function cacheData<T>(
  key: string,
  type: CachedData["type"],
  data: T,
  ttlMs?: number,
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], "readwrite");
    const store = transaction.objectStore(STORES.CACHE);

    const now = Date.now();
    const cachedData: CachedData<T> = {
      key,
      type,
      data,
      updatedAt: now,
      expiresAt: ttlMs ? now + ttlMs : undefined,
    };

    const request = store.put(cachedData);

    request.onerror = () => {
      console.error("[OfflineStorage] Failed to cache data:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Get cached data by key
 */
export async function getCachedData<T>(
  key: string,
): Promise<CachedData<T> | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], "readonly");
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.get(key);

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to get cached data:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      const result = request.result as CachedData<T> | undefined;

      if (!result) {
        resolve(null);
        return;
      }

      // Check if expired
      if (result.expiresAt && result.expiresAt < Date.now()) {
        // Delete expired data
        deleteCachedData(key).catch(console.error);
        resolve(null);
        return;
      }

      resolve(result);
    };
  });
}

/**
 * Get all cached data of a specific type
 */
export async function getCachedDataByType<T>(
  type: CachedData["type"],
): Promise<CachedData<T>[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], "readonly");
    const store = transaction.objectStore(STORES.CACHE);
    const index = store.index("type");
    const request = index.getAll(type);

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to get cached data by type:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      const results = request.result as CachedData<T>[];
      const now = Date.now();

      // Filter out expired data
      const validResults = results.filter((item) => {
        if (item.expiresAt && item.expiresAt < now) {
          deleteCachedData(item.key).catch(console.error);
          return false;
        }
        return true;
      });

      resolve(validResults);
    };
  });
}

/**
 * Delete cached data by key
 */
export async function deleteCachedData(key: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], "readwrite");
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.delete(key);

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to delete cached data:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHE], "readwrite");
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.clear();

    request.onerror = () => {
      console.error("[OfflineStorage] Failed to clear cache:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

// ============================================================================
// Mutation Queue Operations
// ============================================================================

/**
 * Generate a unique ID for mutations
 */
function generateMutationId(): string {
  return `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Queue a mutation for later sync
 */
export async function queueMutation(
  mutation: Omit<QueuedMutation, "id" | "createdAt" | "retryCount">,
): Promise<string> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readwrite");
    const store = transaction.objectStore(STORES.MUTATIONS);

    const id = generateMutationId();
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id,
      createdAt: Date.now(),
      retryCount: 0,
    };

    const request = store.add(queuedMutation);

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to queue mutation:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log("[OfflineStorage] Mutation queued:", id);

      // Request background sync if available
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
          // TypeScript doesn't have full Background Sync API types, so we use type assertion
          const syncManager = registration as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          };
          if (syncManager.sync) {
            syncManager.sync.register("sync-mutations").catch(console.error);
          }
        });
      }

      resolve(id);
    };
  });
}

/**
 * Get all queued mutations
 */
export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readonly");
    const store = transaction.objectStore(STORES.MUTATIONS);
    const index = store.index("createdAt");
    const request = index.getAll();

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to get queued mutations:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Get queued mutations count
 */
export async function getQueuedMutationsCount(): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readonly");
    const store = transaction.objectStore(STORES.MUTATIONS);
    const request = store.count();

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to count mutations:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Delete a queued mutation
 */
export async function deleteMutation(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readwrite");
    const store = transaction.objectStore(STORES.MUTATIONS);
    const request = store.delete(id);

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to delete mutation:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Update mutation retry count
 */
export async function updateMutationRetryCount(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readwrite");
    const store = transaction.objectStore(STORES.MUTATIONS);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const mutation = getRequest.result as QueuedMutation | undefined;
      if (!mutation) {
        resolve();
        return;
      }

      mutation.retryCount += 1;
      const putRequest = store.put(mutation);

      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Clear all queued mutations
 */
export async function clearMutations(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MUTATIONS], "readwrite");
    const store = transaction.objectStore(STORES.MUTATIONS);
    const request = store.clear();

    request.onerror = () => {
      console.error(
        "[OfflineStorage] Failed to clear mutations:",
        request.error,
      );
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

// ============================================================================
// Sync Operations
// ============================================================================

/**
 * Sync all queued mutations with the server
 * Uses last-write-wins for conflict resolution
 */
export async function syncMutations(): Promise<SyncResult> {
  const mutations = await getQueuedMutations();
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    conflicts: 0,
  };

  for (const mutation of mutations) {
    try {
      const response = await fetch(mutation.url, {
        method: mutation.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: mutation.body ? JSON.stringify(mutation.body) : undefined,
      });

      if (response.ok) {
        await deleteMutation(mutation.id);
        result.synced += 1;
      } else if (response.status === 409) {
        // Conflict - last-write-wins, remove from queue
        await deleteMutation(mutation.id);
        result.conflicts += 1;
        console.warn(
          "[OfflineStorage] Conflict detected, discarding local change:",
          mutation.id,
        );
      } else {
        // Other error - keep in queue for retry
        await updateMutationRetryCount(mutation.id);
        result.failed += 1;
        console.error(
          "[OfflineStorage] Failed to sync mutation:",
          mutation.id,
          response.status,
        );
      }
    } catch (error) {
      // Network error - keep in queue
      result.failed += 1;
      console.error(
        "[OfflineStorage] Network error syncing mutation:",
        mutation.id,
        error,
      );
    }
  }

  result.success = result.failed === 0;
  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

/**
 * Get the total size of cached data (approximate)
 */
export async function getCacheSize(): Promise<number> {
  if (!("storage" in navigator && "estimate" in navigator.storage)) {
    return 0;
  }

  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!("storage" in navigator && "persist" in navigator.storage)) {
    return false;
  }

  return navigator.storage.persist();
}

/**
 * Check if storage is persistent
 */
export async function isStoragePersistent(): Promise<boolean> {
  if (!("storage" in navigator && "persisted" in navigator.storage)) {
    return false;
  }

  return navigator.storage.persisted();
}

// ============================================================================
// Entity-specific cache helpers
// ============================================================================

/**
 * Cache farms data
 */
export async function cacheFarms<T>(data: T): Promise<void> {
  await cacheData("farms:all", "farms", data, 5 * 60 * 1000); // 5 minutes TTL
}

/**
 * Get cached farms
 */
export async function getCachedFarms<T>(): Promise<T | null> {
  const cached = await getCachedData<T>("farms:all");
  return cached?.data || null;
}

/**
 * Cache single farm
 */
export async function cacheFarm<T>(id: string, data: T): Promise<void> {
  await cacheData(`farms:${id}`, "farms", data, 5 * 60 * 1000);
}

/**
 * Get cached single farm
 */
export async function getCachedFarm<T>(id: string): Promise<T | null> {
  const cached = await getCachedData<T>(`farms:${id}`);
  return cached?.data || null;
}

/**
 * Cache crops data
 */
export async function cacheCrops<T>(
  data: T,
  filters?: Record<string, string>,
): Promise<void> {
  const key = filters
    ? `crops:filtered:${JSON.stringify(filters)}`
    : "crops:all";
  await cacheData(key, "crops", data, 5 * 60 * 1000);
}

/**
 * Get cached crops
 */
export async function getCachedCrops<T>(
  filters?: Record<string, string>,
): Promise<T | null> {
  const key = filters
    ? `crops:filtered:${JSON.stringify(filters)}`
    : "crops:all";
  const cached = await getCachedData<T>(key);
  return cached?.data || null;
}

/**
 * Cache tasks data
 */
export async function cacheTasks<T>(
  data: T,
  filters?: Record<string, string>,
): Promise<void> {
  const key = filters
    ? `tasks:filtered:${JSON.stringify(filters)}`
    : "tasks:all";
  await cacheData(key, "tasks", data, 5 * 60 * 1000);
}

/**
 * Get cached tasks
 */
export async function getCachedTasks<T>(
  filters?: Record<string, string>,
): Promise<T | null> {
  const key = filters
    ? `tasks:filtered:${JSON.stringify(filters)}`
    : "tasks:all";
  const cached = await getCachedData<T>(key);
  return cached?.data || null;
}

/**
 * Update cached entity after mutation
 * Applies optimistic update to cached data
 */
export async function updateCachedEntity<T extends { id: string }>(
  type: CachedData["type"],
  id: string,
  updater: (item: T) => T,
): Promise<void> {
  // Update in 'all' cache
  const allKey = `${type}:all`;
  const allCached = await getCachedData<T[]>(allKey);

  if (allCached) {
    const updatedData = allCached.data.map((item) =>
      item.id === id ? updater(item) : item,
    );
    await cacheData(allKey, type, updatedData);
  }

  // Update individual cache
  const singleKey = `${type}:${id}`;
  const singleCached = await getCachedData<T>(singleKey);

  if (singleCached) {
    await cacheData(singleKey, type, updater(singleCached.data));
  }
}

/**
 * Remove entity from cache after deletion
 */
export async function removeCachedEntity<T extends { id: string }>(
  type: CachedData["type"],
  id: string,
): Promise<void> {
  // Remove from 'all' cache
  const allKey = `${type}:all`;
  const allCached = await getCachedData<T[]>(allKey);

  if (allCached) {
    const updatedData = allCached.data.filter((item) => item.id !== id);
    await cacheData(allKey, type, updatedData);
  }

  // Remove individual cache
  await deleteCachedData(`${type}:${id}`);
}

/**
 * Add entity to cache after creation
 */
export async function addCachedEntity<T>(
  type: CachedData["type"],
  data: T,
): Promise<void> {
  // Add to 'all' cache
  const allKey = `${type}:all`;
  const allCached = await getCachedData<T[]>(allKey);

  if (allCached) {
    const updatedData = [...allCached.data, data];
    await cacheData(allKey, type, updatedData);
  }
}
