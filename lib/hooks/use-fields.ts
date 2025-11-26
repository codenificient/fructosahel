import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Field, NewField } from "@/types";

const API_BASE = "/api";

// Fetch fields, optionally filtered by farm
export function useFields(farmId?: string | null): FetchState<Field[]> {
  const url = farmId
    ? `${API_BASE}/fields?farmId=${farmId}`
    : `${API_BASE}/fields`;
  return useFetch<Field[]>(url);
}

// Fetch single field by ID
export function useField(id: string | null): FetchState<Field> {
  const url = id ? `${API_BASE}/fields/${id}` : null;
  return useFetch<Field>(url);
}

// Create a new field
export function useCreateField(
  onSuccess?: (data: Field) => void
): MutationState<NewField> {
  return useMutation<NewField>(`${API_BASE}/fields`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing field
export function useUpdateField(
  onSuccess?: (data: Field) => void
): MutationState<{ id: string } & Partial<Field>> {
  return useMutation<{ id: string } & Partial<Field>>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    }
  );
}

// Delete a field
export function useDeleteField(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/fields/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
