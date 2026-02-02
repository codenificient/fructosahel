"use client";

import { useMemo } from "react";
import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import {
  useOptimisticMutation,
  generateTempId,
  type OptimisticMutationState,
  type ToastHandlers,
} from "./use-optimistic-mutation";
import {
  useDataStore,
  useDataStoreAccess,
  type DataStoreState,
} from "./use-data-store";
import type { Farm, NewFarm } from "@/types";

const API_BASE = "/api";
const FARMS_STORE_KEY = "farms";

/**
 * Options for optimistic mutation hooks
 */
export interface OptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Farm) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

/**
 * Fetch all farms with shared data store for optimistic updates
 */
export function useFarmsOptimistic(): DataStoreState<Farm[]> {
  return useDataStore<Farm[]>(FARMS_STORE_KEY, `${API_BASE}/farms`);
}

/**
 * Fetch all farms with offline caching support
 */
export function useFarms(): FetchState<Farm[]> {
  return useFetch<Farm[]>(`${API_BASE}/farms`, {
    cacheKey: "farms:all",
    cacheType: "farms",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch single farm by ID with offline caching support
 */
export function useFarm(id: string | null): FetchState<Farm> {
  const url = id ? `${API_BASE}/farms/${id}` : null;
  return useFetch<Farm>(url, {
    cacheKey: id ? `farms:${id}` : undefined,
    cacheType: "farms",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new farm with optimistic update
 */
export function useCreateFarmOptimistic(
  options: OptimisticOptions = {},
): OptimisticMutationState<NewFarm, Farm> {
  const { setData, getCurrentData } =
    useDataStoreAccess<Farm[]>(FARMS_STORE_KEY);

  return useOptimisticMutation<Farm[], NewFarm, Farm>(`${API_BASE}/farms`, {
    method: "POST",
    toast: options.toast,
    successMessage: "Farm created successfully",
    errorMessage: "Failed to create farm",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempFarm: Farm = {
          id: generateTempId(),
          name: input.name,
          country: input.country,
          location: input.location,
          sizeHectares: input.sizeHectares,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          description: input.description ?? null,
          managerId: input.managerId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...(currentData || []), tempFarm];
      },
    },
  });
}

/**
 * Create a new farm with offline queueing support
 */
export function useCreateFarm(
  onSuccess?: (data: Farm) => void,
): MutationState<NewFarm> {
  return useMutation<NewFarm>(`${API_BASE}/farms`, {
    method: "POST",
    onSuccess,
    offlineSupport: true,
    entityType: "farms",
    optimisticUpdate: (data) =>
      ({
        ...data,
        id: `temp_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as unknown as NewFarm,
  });
}

/**
 * Update an existing farm with optimistic update
 */
export function useUpdateFarmOptimistic(
  options: OptimisticOptions = {},
): OptimisticMutationState<{ id: string } & Partial<Farm>, Farm> {
  const { setData, getCurrentData } =
    useDataStoreAccess<Farm[]>(FARMS_STORE_KEY);

  return useOptimisticMutation<Farm[], { id: string } & Partial<Farm>, Farm>(
    (data) => `${API_BASE}/farms/${data.id}`,
    {
      method: "PUT",
      toast: options.toast,
      successMessage: "Farm updated successfully",
      errorMessage: "Failed to update farm",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.map((farm) =>
            farm.id === input.id
              ? { ...farm, ...input, updatedAt: new Date() }
              : farm,
          );
        },
      },
    },
  );
}

/**
 * Update an existing farm with offline queueing support
 */
export function useUpdateFarm(
  onSuccess?: (data: Farm) => void,
): MutationState<{ id: string } & Partial<Farm>> {
  return useMutation<{ id: string } & Partial<Farm>>(
    (data) => `${API_BASE}/farms/${data.id}`,
    {
      method: "PUT",
      onSuccess,
      offlineSupport: true,
      entityType: "farms",
      getEntityId: (data) => data.id,
    },
  );
}

/**
 * Delete a farm with optimistic update
 */
export function useDeleteFarmOptimistic(
  options: Omit<OptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
): OptimisticMutationState<{ id: string }, any> {
  const { setData, getCurrentData } =
    useDataStoreAccess<Farm[]>(FARMS_STORE_KEY);

  return useOptimisticMutation<Farm[], { id: string }, any>(
    (data) => `${API_BASE}/farms/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Farm deleted successfully",
      errorMessage: "Failed to delete farm",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.filter((farm) => farm.id !== input.id);
        },
      },
    },
  );
}

/**
 * Delete a farm with offline queueing support
 */
export function useDeleteFarm(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>((data) => `${API_BASE}/farms/${data.id}`, {
    method: "DELETE",
    onSuccess,
    offlineSupport: true,
    entityType: "farms",
    getEntityId: (data) => data.id,
  });
}
