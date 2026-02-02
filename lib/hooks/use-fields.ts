"use client";

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
import type { Field, NewField } from "@/types";

const API_BASE = "/api";
const FIELDS_STORE_KEY = "fields";

/**
 * Options for optimistic mutation hooks
 */
export interface FieldOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Field) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

// Generate store key based on farm filter
function getFieldsStoreKey(farmId?: string | null): string {
  return farmId ? `${FIELDS_STORE_KEY}?farmId=${farmId}` : FIELDS_STORE_KEY;
}

/**
 * Fetch fields with shared data store for optimistic updates
 */
export function useFieldsOptimistic(
  farmId?: string | null,
): DataStoreState<Field[]> {
  const url = farmId
    ? `${API_BASE}/fields?farmId=${farmId}`
    : `${API_BASE}/fields`;
  const storeKey = getFieldsStoreKey(farmId);
  return useDataStore<Field[]>(storeKey, url);
}

/**
 * Fetch fields, optionally filtered by farm (legacy, non-optimistic version)
 */
export function useFields(farmId?: string | null): FetchState<Field[]> {
  const url = farmId
    ? `${API_BASE}/fields?farmId=${farmId}`
    : `${API_BASE}/fields`;
  return useFetch<Field[]>(url);
}

/**
 * Fetch single field by ID
 */
export function useField(id: string | null): FetchState<Field> {
  const url = id ? `${API_BASE}/fields/${id}` : null;
  return useFetch<Field>(url);
}

/**
 * Create a new field with optimistic update
 */
export function useCreateFieldOptimistic(
  options: FieldOptimisticOptions = {},
  farmId?: string | null,
): OptimisticMutationState<NewField, Field> {
  const storeKey = getFieldsStoreKey(farmId);
  const { setData, getCurrentData } = useDataStoreAccess<Field[]>(storeKey);

  return useOptimisticMutation<Field[], NewField, Field>(`${API_BASE}/fields`, {
    method: "POST",
    toast: options.toast,
    successMessage: "Field created successfully",
    errorMessage: "Failed to create field",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempField: Field = {
          id: generateTempId(),
          farmId: input.farmId,
          name: input.name,
          sizeHectares: input.sizeHectares ? String(input.sizeHectares) : "0",
          soilType: input.soilType || null,
          irrigationType: input.irrigationType || null,
          notes: input.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...(currentData || []), tempField];
      },
    },
  });
}

/**
 * Create a new field (legacy, non-optimistic version)
 */
export function useCreateField(
  onSuccess?: (data: Field) => void,
): MutationState<NewField> {
  return useMutation<NewField>(`${API_BASE}/fields`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing field with optimistic update
 */
export function useUpdateFieldOptimistic(
  options: FieldOptimisticOptions = {},
  farmId?: string | null,
): OptimisticMutationState<{ id: string } & Partial<Field>, Field> {
  const storeKey = getFieldsStoreKey(farmId);
  const { setData, getCurrentData } = useDataStoreAccess<Field[]>(storeKey);

  return useOptimisticMutation<Field[], { id: string } & Partial<Field>, Field>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "PUT",
      toast: options.toast,
      successMessage: "Field updated successfully",
      errorMessage: "Failed to update field",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.map((field) =>
            field.id === input.id
              ? { ...field, ...input, updatedAt: new Date() }
              : field,
          );
        },
      },
    },
  );
}

/**
 * Update an existing field (legacy, non-optimistic version)
 */
export function useUpdateField(
  onSuccess?: (data: Field) => void,
): MutationState<{ id: string } & Partial<Field>> {
  return useMutation<{ id: string } & Partial<Field>>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a field with optimistic update
 */
export function useDeleteFieldOptimistic(
  options: Omit<FieldOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  farmId?: string | null,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getFieldsStoreKey(farmId);
  const { setData, getCurrentData } = useDataStoreAccess<Field[]>(storeKey);

  return useOptimisticMutation<Field[], { id: string }, any>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Field deleted successfully",
      errorMessage: "Failed to delete field",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.filter((field) => field.id !== input.id);
        },
      },
    },
  );
}

/**
 * Delete a field (legacy, non-optimistic version)
 */
export function useDeleteField(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
