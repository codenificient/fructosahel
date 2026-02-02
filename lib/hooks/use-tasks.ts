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
import type { Task, NewTask, TaskStatus, TaskPriority } from "@/types";

const API_BASE = "/api";
const TASKS_STORE_KEY = "tasks";

export interface TaskFilters {
  farmId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/**
 * Options for optimistic mutation hooks
 */
export interface TaskOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Task) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
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

// Generate store key based on filters
function getTasksStoreKey(filters?: TaskFilters): string {
  const query = buildTaskQuery(filters);
  return `${TASKS_STORE_KEY}${query}`;
}

/**
 * Fetch tasks with optional filters and shared data store for optimistic updates
 */
export function useTasksOptimistic(
  filters?: TaskFilters,
): DataStoreState<Task[]> {
  const query = buildTaskQuery(filters);
  const storeKey = getTasksStoreKey(filters);
  return useDataStore<Task[]>(storeKey, `${API_BASE}/tasks${query}`);
}

/**
 * Fetch tasks with optional filters and offline caching support
 */
export function useTasks(filters?: TaskFilters): FetchState<Task[]> {
  const query = buildTaskQuery(filters);
  const cacheKey = filters
    ? `tasks:filtered:${JSON.stringify(filters)}`
    : "tasks:all";
  return useFetch<Task[]>(`${API_BASE}/tasks${query}`, {
    cacheKey,
    cacheType: "tasks",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch single task by ID with offline caching support
 */
export function useTask(id: string | null): FetchState<Task> {
  const url = id ? `${API_BASE}/tasks/${id}` : null;
  return useFetch<Task>(url, {
    cacheKey: id ? `tasks:${id}` : undefined,
    cacheType: "tasks",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new task with optimistic update
 */
export function useCreateTaskOptimistic(
  options: TaskOptimisticOptions = {},
  filters?: TaskFilters,
): OptimisticMutationState<NewTask, Task> {
  const storeKey = getTasksStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Task[]>(storeKey);

  return useOptimisticMutation<Task[], NewTask, Task>(`${API_BASE}/tasks`, {
    method: "POST",
    toast: options.toast,
    successMessage: "Task created successfully",
    errorMessage: "Failed to create task",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempTask: Task = {
          id: generateTempId(),
          farmId: input.farmId ?? null,
          cropId: input.cropId ?? null,
          title: input.title,
          description: input.description ?? null,
          status: input.status || "pending",
          priority: input.priority || "medium",
          assignedTo: input.assignedTo ?? null,
          createdBy: input.createdBy,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...(currentData || []), tempTask];
      },
    },
  });
}

/**
 * Create a new task with offline queueing support
 */
export function useCreateTask(
  onSuccess?: (data: Task) => void,
): MutationState<NewTask> {
  return useMutation<NewTask>(`${API_BASE}/tasks`, {
    method: "POST",
    onSuccess,
    offlineSupport: true,
    entityType: "tasks",
    optimisticUpdate: (data) =>
      ({
        ...data,
        id: `temp_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as unknown as NewTask,
  });
}

/**
 * Update an existing task with optimistic update
 */
export function useUpdateTaskOptimistic(
  options: TaskOptimisticOptions = {},
  filters?: TaskFilters,
): OptimisticMutationState<{ id: string } & Partial<Task>, Task> {
  const storeKey = getTasksStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Task[]>(storeKey);

  return useOptimisticMutation<Task[], { id: string } & Partial<Task>, Task>(
    (data) => `${API_BASE}/tasks/${data.id}`,
    {
      method: "PATCH",
      toast: options.toast,
      successMessage: "Task updated successfully",
      errorMessage: "Failed to update task",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.map((task) =>
            task.id === input.id
              ? {
                  ...task,
                  ...input,
                  updatedAt: new Date(),
                  // If status changed to completed, set completedAt
                  completedAt:
                    input.status === "completed"
                      ? new Date()
                      : task.completedAt,
                }
              : task,
          );
        },
      },
    },
  );
}

/**
 * Update an existing task with offline queueing support
 */
export function useUpdateTask(
  onSuccess?: (data: Task) => void,
): MutationState<{ id: string } & Partial<Task>> {
  return useMutation<{ id: string } & Partial<Task>>(
    (data) => `${API_BASE}/tasks/${data.id}`,
    {
      method: "PATCH",
      onSuccess,
      offlineSupport: true,
      entityType: "tasks",
      getEntityId: (data) => data.id,
    },
  );
}

/**
 * Delete a task with optimistic update
 */
export function useDeleteTaskOptimistic(
  options: Omit<TaskOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  filters?: TaskFilters,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getTasksStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<Task[]>(storeKey);

  return useOptimisticMutation<Task[], { id: string }, any>(
    (data) => `${API_BASE}/tasks/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Task deleted successfully",
      errorMessage: "Failed to delete task",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.filter((task) => task.id !== input.id);
        },
      },
    },
  );
}

/**
 * Delete a task with offline queueing support
 */
export function useDeleteTask(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>((data) => `${API_BASE}/tasks/${data.id}`, {
    method: "DELETE",
    onSuccess,
    offlineSupport: true,
    entityType: "tasks",
    getEntityId: (data) => data.id,
  });
}
