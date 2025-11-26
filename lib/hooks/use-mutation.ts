import { useState, useCallback } from "react";

export interface MutationState<T> {
  mutate: (data: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  data: any | null;
  reset: () => void;
}

export interface MutationOptions {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useMutation<T = any>(
  url: string | ((data: T) => string),
  options: MutationOptions
): MutationState<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  const mutate = useCallback(
    async (mutationData: T) => {
      try {
        setIsLoading(true);
        setError(null);

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
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);

        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error("An error occurred");
        setError(errorObj);

        if (options.onError) {
          options.onError(errorObj);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  return { mutate, isLoading, error, data, reset };
}
