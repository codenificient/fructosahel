import { useState, useCallback, useRef, useEffect } from "react";
import {
  queueMutation,
  addCachedEntity,
  updateCachedEntity,
  removeCachedEntity,
  type CachedData,
} from "@/lib/utils/offline-storage";

export interface MutationState<T> {
  mutate: (data: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  data: any | null;
  reset: () => void;
  isQueued: boolean;
  queuedId: string | null;
}

export interface MutationOptions<T = any> {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  /**
   * Enable offline queueing for this mutation
   * When offline, the mutation will be queued and synced later
   */
  offlineSupport?: boolean;
  /**
   * Entity type for cache updates (e.g., 'farms', 'crops', 'tasks')
   */
  entityType?: CachedData["type"];
  /**
   * Function to extract the entity ID from the mutation data
   */
  getEntityId?: (data: T) => string | undefined;
  /**
   * Optimistic update function
   * Called immediately when offline to update the local cache
   */
  optimisticUpdate?: (data: T) => T;
}

export function useMutation<T = any>(
  url: string | ((data: T) => string),
  options: MutationOptions<T>,
): MutationState<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [queuedId, setQueuedId] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
    setIsQueued(false);
    setQueuedId(null);
  }, []);

  const mutate = useCallback(
    async (mutationData: T) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsQueued(false);
        setQueuedId(null);

        const endpoint = typeof url === "function" ? url(mutationData) : url;
        const requestOptions: RequestInit = {
          method: options.method,
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Only include body for non-DELETE requests
        if (options.method !== "DELETE") {
          requestOptions.body = JSON.stringify(mutationData);
        }

        const response = await fetch(endpoint, requestOptions);

        // Check if the response indicates offline status
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.offline) {
            throw new Error("OFFLINE");
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();

        if (isMounted.current) {
          setData(result);

          if (options.onSuccess) {
            options.onSuccess(result);
          }
        }
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An error occurred");

        // Handle offline scenario
        if (
          options.offlineSupport &&
          (errorObj.message === "OFFLINE" ||
            errorObj.message.includes("fetch") ||
            !navigator.onLine)
        ) {
          // Queue the mutation for later sync
          try {
            const endpoint =
              typeof url === "function" ? url(mutationData) : url;
            const entityId = options.getEntityId?.(mutationData);

            const mutationType =
              options.method === "POST"
                ? "create"
                : options.method === "DELETE"
                  ? "delete"
                  : "update";

            const id = await queueMutation({
              url: endpoint,
              method: options.method,
              body: options.method !== "DELETE" ? mutationData : undefined,
              type: mutationType,
              entityType: options.entityType || "farms",
              entityId,
            });

            if (isMounted.current) {
              setIsQueued(true);
              setQueuedId(id);
              setError(null);

              // Apply optimistic update to local cache
              if (options.entityType) {
                const dataToCache = options.optimisticUpdate
                  ? options.optimisticUpdate(mutationData)
                  : mutationData;

                if (options.method === "POST") {
                  await addCachedEntity(options.entityType, dataToCache);
                } else if (options.method === "DELETE" && entityId) {
                  await removeCachedEntity(options.entityType, entityId);
                } else if (entityId) {
                  await updateCachedEntity(
                    options.entityType,
                    entityId,
                    () => dataToCache as unknown as { id: string },
                  );
                }
              }

              // Still call onSuccess with optimistic data
              if (options.onSuccess) {
                const optimisticResult = {
                  ...mutationData,
                  _queued: true,
                  _queuedId: id,
                };
                options.onSuccess(optimisticResult);
              }
            }

            console.log("[useMutation] Mutation queued for offline sync:", id);
            return;
          } catch (queueError) {
            console.error(
              "[useMutation] Failed to queue mutation:",
              queueError,
            );
            // Fall through to error handling
          }
        }

        if (isMounted.current) {
          setError(errorObj);

          if (options.onError) {
            options.onError(errorObj);
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [url, options],
  );

  return { mutate, isLoading, error, data, reset, isQueued, queuedId };
}
