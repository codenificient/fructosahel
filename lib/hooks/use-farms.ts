import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Farm, NewFarm } from "@/types";

const API_BASE = "/api";

// Fetch all farms
export function useFarms(): FetchState<Farm[]> {
  return useFetch<Farm[]>(`${API_BASE}/farms`);
}

// Fetch single farm by ID
export function useFarm(id: string | null): FetchState<Farm> {
  const url = id ? `${API_BASE}/farms/${id}` : null;
  return useFetch<Farm>(url);
}

// Create a new farm
export function useCreateFarm(
  onSuccess?: (data: Farm) => void
): MutationState<NewFarm> {
  return useMutation<NewFarm>(`${API_BASE}/farms`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing farm
export function useUpdateFarm(
  onSuccess?: (data: Farm) => void
): MutationState<{ id: string } & Partial<Farm>> {
  return useMutation<{ id: string } & Partial<Farm>>(
    (data) => `${API_BASE}/farms/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    }
  );
}

// Delete a farm
export function useDeleteFarm(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/farms/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
