"use client";

import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Livestock, NewLivestock } from "@/types";

const API_BASE = "/api";

/**
 * Fetch livestock with optional farmId filter
 */
export function useLivestock(farmId?: string): FetchState<Livestock[]> {
  const query = farmId ? `?farmId=${farmId}` : "";
  return useFetch<Livestock[]>(`${API_BASE}/livestock${query}`, {
    cacheKey: farmId ? `livestock:farm:${farmId}` : "livestock:all",
    cacheType: "livestock",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new livestock entry
 */
export function useCreateLivestock(
  onSuccess?: (data: Livestock) => void,
): MutationState<NewLivestock> {
  return useMutation<NewLivestock>(`${API_BASE}/livestock`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing livestock entry
 */
export function useUpdateLivestock(
  onSuccess?: (data: Livestock) => void,
): MutationState<{ id: string } & Partial<Livestock>> {
  return useMutation<{ id: string } & Partial<Livestock>>(
    (data) => `${API_BASE}/livestock/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a livestock entry
 */
export function useDeleteLivestock(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/livestock/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
