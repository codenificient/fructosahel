import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Crop, NewCrop, CropType, CropStatus } from "@/types";

const API_BASE = "/api";

export interface CropFilters {
  fieldId?: string;
  cropType?: CropType;
  status?: CropStatus;
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

// Fetch crops with optional filters
export function useCrops(filters?: CropFilters): FetchState<Crop[]> {
  const query = buildCropQuery(filters);
  return useFetch<Crop[]>(`${API_BASE}/crops${query}`);
}

// Fetch single crop by ID
export function useCrop(id: string | null): FetchState<Crop> {
  const url = id ? `${API_BASE}/crops/${id}` : null;
  return useFetch<Crop>(url);
}

// Create a new crop
export function useCreateCrop(
  onSuccess?: (data: Crop) => void
): MutationState<NewCrop> {
  return useMutation<NewCrop>(`${API_BASE}/crops`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing crop
export function useUpdateCrop(
  onSuccess?: (data: Crop) => void
): MutationState<{ id: string } & Partial<Crop>> {
  return useMutation<{ id: string } & Partial<Crop>>(
    (data) => `${API_BASE}/crops/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    }
  );
}

// Delete a crop
export function useDeleteCrop(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/crops/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
