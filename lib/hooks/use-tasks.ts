import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Task, NewTask, TaskStatus, TaskPriority } from "@/types";

const API_BASE = "/api";

export interface TaskFilters {
  farmId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// Build query string from filters
function buildTaskQuery(filters?: TaskFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.farmId) params.append("farmId", filters.farmId);
  if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);

  const query = params.toString();
  return query ? `?${query}` : "";
}

// Fetch tasks with optional filters
export function useTasks(filters?: TaskFilters): FetchState<Task[]> {
  const query = buildTaskQuery(filters);
  return useFetch<Task[]>(`${API_BASE}/tasks${query}`);
}

// Fetch single task by ID
export function useTask(id: string | null): FetchState<Task> {
  const url = id ? `${API_BASE}/tasks/${id}` : null;
  return useFetch<Task>(url);
}

// Create a new task
export function useCreateTask(
  onSuccess?: (data: Task) => void
): MutationState<NewTask> {
  return useMutation<NewTask>(`${API_BASE}/tasks`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing task
export function useUpdateTask(
  onSuccess?: (data: Task) => void
): MutationState<{ id: string } & Partial<Task>> {
  return useMutation<{ id: string } & Partial<Task>>(
    (data) => `${API_BASE}/tasks/${data.id}`,
    {
      method: "PATCH",
      onSuccess,
    }
  );
}

// Delete a task
export function useDeleteTask(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/tasks/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
