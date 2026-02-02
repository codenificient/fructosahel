"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Configuration for optimistic updates
 */
export interface OptimisticConfig<TData, TInput> {
  /** Function to get current data state */
  getCurrentData: () => TData | null;
  /** Function to update the local data state */
  setData: (data: TData | null) => void;
  /** Function to create optimistic data for create operations */
  createOptimisticData?: (input: TInput, currentData: TData | null) => TData;
  /** Function to create optimistic data for update operations */
  updateOptimisticData?: (input: TInput, currentData: TData | null) => TData;
  /** Function to create optimistic data for delete operations */
  deleteOptimisticData?: (input: TInput, currentData: TData | null) => TData;
}

/**
 * Toast notification functions
 */
export interface ToastHandlers {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

/**
 * Options for the optimistic mutation hook
 */
export interface OptimisticMutationOptions<TData, TInput, TResponse> {
  /** HTTP method for the mutation */
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Optimistic update configuration */
  optimistic?: OptimisticConfig<TData, TInput>;
  /** Toast handlers for notifications */
  toast?: ToastHandlers;
  /** Success message to display */
  successMessage?: string;
  /** Error message prefix */
  errorMessage?: string;
  /** Callback on successful mutation */
  onSuccess?: (data: TResponse) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback to refetch data after mutation */
  onSettled?: () => void;
}

/**
 * State returned by the optimistic mutation hook
 */
export interface OptimisticMutationState<TInput, TResponse> {
  /** Execute the mutation */
  mutate: (data: TInput) => Promise<TResponse | undefined>;
  /** Execute the mutation with optimistic update */
  mutateAsync: (data: TInput) => Promise<TResponse>;
  /** Whether the mutation is in progress */
  isLoading: boolean;
  /** Whether this is an optimistic update in progress */
  isOptimistic: boolean;
  /** Error from the mutation */
  error: Error | null;
  /** Response data from successful mutation */
  data: TResponse | null;
  /** Reset the mutation state */
  reset: () => void;
}

/**
 * Hook for mutations with optimistic update support
 */
export function useOptimisticMutation<TData, TInput, TResponse = TInput>(
  url: string | ((data: TInput) => string),
  options: OptimisticMutationOptions<TData, TInput, TResponse>,
): OptimisticMutationState<TInput, TResponse> {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  // Store previous data for rollback
  const previousDataRef = useRef<TData | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
    setIsOptimistic(false);
    previousDataRef.current = null;
  }, []);

  const rollback = useCallback(() => {
    if (options.optimistic && previousDataRef.current !== null) {
      options.optimistic.setData(previousDataRef.current);
      previousDataRef.current = null;
    }
    setIsOptimistic(false);
  }, [options.optimistic]);

  const applyOptimisticUpdate = useCallback(
    (input: TInput) => {
      if (!options.optimistic) return;

      const currentData = options.optimistic.getCurrentData();
      previousDataRef.current = currentData;

      let optimisticData: TData | null = null;

      switch (options.method) {
        case "POST":
          if (options.optimistic.createOptimisticData) {
            optimisticData = options.optimistic.createOptimisticData(
              input,
              currentData,
            );
          }
          break;
        case "PUT":
        case "PATCH":
          if (options.optimistic.updateOptimisticData) {
            optimisticData = options.optimistic.updateOptimisticData(
              input,
              currentData,
            );
          }
          break;
        case "DELETE":
          if (options.optimistic.deleteOptimisticData) {
            optimisticData = options.optimistic.deleteOptimisticData(
              input,
              currentData,
            );
          }
          break;
      }

      if (optimisticData !== null) {
        options.optimistic.setData(optimisticData);
        setIsOptimistic(true);
      }
    },
    [options.optimistic, options.method],
  );

  const mutateAsync = useCallback(
    async (mutationData: TInput): Promise<TResponse> => {
      try {
        setIsLoading(true);
        setError(null);

        // Apply optimistic update
        applyOptimisticUpdate(mutationData);

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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        setData(result);
        setIsOptimistic(false);
        previousDataRef.current = null;

        // Show success toast
        if (options.toast && options.successMessage) {
          options.toast.success(options.successMessage);
        }

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        // Call settled callback
        if (options.onSettled) {
          options.onSettled();
        }

        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An error occurred");
        setError(errorObj);

        // Rollback optimistic update
        rollback();

        // Show error toast
        if (options.toast) {
          const errorPrefix = options.errorMessage || "Operation failed";
          options.toast.error(errorPrefix, errorObj.message);
        }

        // Call error callback
        if (options.onError) {
          options.onError(errorObj);
        }

        // Call settled callback even on error
        if (options.onSettled) {
          options.onSettled();
        }

        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [url, options, applyOptimisticUpdate, rollback],
  );

  const mutate = useCallback(
    async (mutationData: TInput): Promise<TResponse | undefined> => {
      try {
        return await mutateAsync(mutationData);
      } catch {
        // Error is already handled in mutateAsync
        return undefined;
      }
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    isOptimistic,
    error,
    data,
    reset,
  };
}

/**
 * Helper function to generate a temporary ID for optimistic creates
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper to check if an ID is a temporary ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith("temp-");
}
