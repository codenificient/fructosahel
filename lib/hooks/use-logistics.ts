"use client";

import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { LogisticsOrder, NewLogisticsOrder } from "@/types";

const API_BASE = "/api";

/**
 * Fetch logistics orders with optional farmId filter
 */
export function useLogisticsOrders(farmId?: string): FetchState<LogisticsOrder[]> {
  const query = farmId ? `?farmId=${farmId}` : "";
  return useFetch<LogisticsOrder[]>(`${API_BASE}/logistics${query}`, {
    cacheKey: farmId ? `logistics:farm:${farmId}` : "logistics:all",
    cacheType: "logistics",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch a single logistics order
 */
export function useLogisticsOrder(id: string): FetchState<LogisticsOrder> {
  return useFetch<LogisticsOrder>(`${API_BASE}/logistics/${id}`, {
    cacheKey: `logistics:${id}`,
    cacheType: "logistics",
  });
}

/**
 * Create a new logistics order
 */
export function useCreateLogisticsOrder(
  onSuccess?: (data: LogisticsOrder) => void,
): MutationState<NewLogisticsOrder> {
  return useMutation<NewLogisticsOrder>(`${API_BASE}/logistics`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing logistics order
 */
export function useUpdateLogisticsOrder(
  onSuccess?: (data: LogisticsOrder) => void,
): MutationState<{ id: string } & Partial<LogisticsOrder>> {
  return useMutation<{ id: string } & Partial<LogisticsOrder>>(
    (data) => `${API_BASE}/logistics/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a logistics order
 */
export function useDeleteLogisticsOrder(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/logistics/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
