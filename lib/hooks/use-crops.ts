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
import type { Crop, NewCrop, CropType, CropStatus } from "@/types";

const API_BASE = "/api";
const CROPS_STORE_KEY = "crops";

export interface CropFilters {
  fieldId?: string;
  cropType?: CropType;
  status?: CropStatus;
}

/**
 * Options for optimistic mutation hooks
 */
export interface CropOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Crop) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

// Build query string from filters
function buildCropQuery(filters?: CropFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.fieldId) params.append("fieldId", filters.fieldId);
  if (filters.cropType) params.append("cropType", filters.cropType);
  if (filters.status) params.append("status", filters.status);

  const query = params.toString();
  return query ? `?${query}` : "";
}

// Generate store key based on filters
function getCropsStoreKey(filters?: CropFilters): string {
  const query = buildCropQuery(filters);
  return `${CROPS_STORE_KEY}${query}`;
}

/**
 * Fetch crops with optional filters and shared data store for optimistic updates
 */
export function useCropsOptimistic(
  filters?: CropFilters,
): DataStoreState<Crop[]> {
  const query = buildCropQuery(filters);
  const storeKey = getCropsStoreKey(filters);
  return useDataStore<Crop[]>(storeKey, `${API_BASE}/crops${query}`);
}

/**
 * Fetch crops with optional filters and offline caching support
 */
export function useCrops(filters?: CropFilters): FetchState<Crop[]> {
  const query = buildCropQuery(filters);
  const cacheKey = filters
    ? `crops:filtered:${JSON.stringify(filters)}`
    : "crops:all";
  return useFetch<Crop[]>(`${API_BASE}/crops${query}`, {
    cacheKey,
    cacheType: "crops",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch single crop by ID with offline caching support
 */
export function useCrop(id: string | null): FetchState<Crop> {
  const url = id ? `${API_BASE}/crops/${id}` : null;
  return useFetch<Crop>(url, {
    cacheKey: id ? `crops:${id}` : undefined,
    cacheType: "crops",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new crop with optimistic update
 */
export function useCreateCropOptimistic(
  options: CropOptimisticOptions = {},
  filters?: CropFilters,
): OptimisticMutationState<NewCrop, Crop> {
  const storeKey = getCropsStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Crop[]>(storeKey);

  return useOptimisticMutation<Crop[], NewCrop, Crop>(`${API_BASE}/crops`, {
    method: "POST",
    toast: options.toast,
    successMessage: "Crop created successfully",
    errorMessage: "Failed to create crop",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempCrop: Crop = {
          id: generateTempId(),
          fieldId: input.fieldId,
          cropType: input.cropType,
          variety: input.variety ?? null,
          plantingDate: input.plantingDate
            ? new Date(input.plantingDate)
            : null,
          expectedHarvestDate: input.expectedHarvestDate
            ? new Date(input.expectedHarvestDate)
            : null,
          actualHarvestDate: null,
          status: input.status || "planning",
          numberOfPlants: input.numberOfPlants ?? null,
          expectedYieldKg: input.expectedYieldKg
            ? String(input.expectedYieldKg)
            : null,
          actualYieldKg: null,
          notes: input.notes ?? null,
          imageUrl: input.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...(currentData || []), tempCrop];
      },
    },
  });
}

/**
 * Create a new crop with offline queueing support
 */
export function useCreateCrop(
  onSuccess?: (data: Crop) => void,
): MutationState<NewCrop> {
  return useMutation<NewCrop>(`${API_BASE}/crops`, {
    method: "POST",
    onSuccess,
    offlineSupport: true,
    entityType: "crops",
    optimisticUpdate: (data) =>
      ({
        ...data,
        id: `temp_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as unknown as NewCrop,
  });
}

/**
 * Update an existing crop with optimistic update
 */
export function useUpdateCropOptimistic(
  options: CropOptimisticOptions = {},
  filters?: CropFilters,
): OptimisticMutationState<{ id: string } & Partial<Crop>, Crop> {
  const storeKey = getCropsStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Crop[]>(storeKey);

  return useOptimisticMutation<Crop[], { id: string } & Partial<Crop>, Crop>(
    (data) => `${API_BASE}/crops/${data.id}`,
    {
      method: "PUT",
      toast: options.toast,
      successMessage: "Crop updated successfully",
      errorMessage: "Failed to update crop",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.map((crop) =>
            crop.id === input.id
              ? { ...crop, ...input, updatedAt: new Date() }
              : crop,
          );
        },
      },
    },
  );
}

/**
 * Update an existing crop with offline queueing support
 */
export function useUpdateCrop(
  onSuccess?: (data: Crop) => void,
): MutationState<{ id: string } & Partial<Crop>> {
  return useMutation<{ id: string } & Partial<Crop>>(
    (data) => `${API_BASE}/crops/${data.id}`,
    {
      method: "PUT",
      onSuccess,
      offlineSupport: true,
      entityType: "crops",
      getEntityId: (data) => data.id,
    },
  );
}

/**
 * Delete a crop with optimistic update
 */
export function useDeleteCropOptimistic(
  options: Omit<CropOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  filters?: CropFilters,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getCropsStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Crop[]>(storeKey);

  return useOptimisticMutation<Crop[], { id: string }, any>(
    (data) => `${API_BASE}/crops/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Crop deleted successfully",
      errorMessage: "Failed to delete crop",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.filter((crop) => crop.id !== input.id);
        },
      },
    },
  );
}

/**
 * Delete a crop with offline queueing support
 */
export function useDeleteCrop(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>((data) => `${API_BASE}/crops/${data.id}`, {
    method: "DELETE",
    onSuccess,
    offlineSupport: true,
    entityType: "crops",
    getEntityId: (data) => data.id,
  });
}
