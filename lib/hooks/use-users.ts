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
import type { User, NewUser, UserRole } from "@/types";

const API_BASE = "/api";
const USERS_STORE_KEY = "users";

/**
 * Options for optimistic mutation hooks
 */
export interface UserOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: User) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

// Generate store key based on role filter
function getUsersStoreKey(role?: UserRole | null): string {
  return role ? `${USERS_STORE_KEY}?role=${role}` : USERS_STORE_KEY;
}

/**
 * Fetch users with shared data store for optimistic updates
 */
export function useUsersOptimistic(
  role?: UserRole | null,
): DataStoreState<User[]> {
  const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
  const storeKey = getUsersStoreKey(role);
  return useDataStore<User[]>(storeKey, url);
}

/**
 * Fetch users, optionally filtered by role (legacy, non-optimistic version)
 */
export function useUsers(role?: UserRole | null): FetchState<User[]> {
  const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
  return useFetch<User[]>(url);
}

/**
 * Fetch single user by ID
 */
export function useUser(id: string | null): FetchState<User> {
  const url = id ? `${API_BASE}/users/${id}` : null;
  return useFetch<User>(url);
}

/**
 * Create a new user with optimistic update
 */
export function useCreateUserOptimistic(
  options: UserOptimisticOptions = {},
  role?: UserRole | null,
): OptimisticMutationState<NewUser, User> {
  const storeKey = getUsersStoreKey(role);
  const { setData, getCurrentData } = useDataStoreAccess<User[]>(storeKey);

  return useOptimisticMutation<User[], NewUser, User>(`${API_BASE}/users`, {
    method: "POST",
    toast: options.toast,
    successMessage: "User created successfully",
    errorMessage: "Failed to create user",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempUser: User = {
          id: generateTempId(),
          email: input.email,
          name: input.name,
          role: input.role || "viewer",
          phone: input.phone ?? null,
          avatarUrl: input.avatarUrl ?? null,
          language: input.language || "en",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return [...(currentData || []), tempUser];
      },
    },
  });
}

/**
 * Create a new user (legacy, non-optimistic version)
 */
export function useCreateUser(
  onSuccess?: (data: User) => void,
): MutationState<NewUser> {
  return useMutation<NewUser>(`${API_BASE}/users`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing user with optimistic update
 */
export function useUpdateUserOptimistic(
  options: UserOptimisticOptions = {},
  role?: UserRole | null,
): OptimisticMutationState<{ id: string } & Partial<User>, User> {
  const storeKey = getUsersStoreKey(role);
  const { setData, getCurrentData } = useDataStoreAccess<User[]>(storeKey);

  return useOptimisticMutation<User[], { id: string } & Partial<User>, User>(
    (data) => `${API_BASE}/users/${data.id}`,
    {
      method: "PUT",
      toast: options.toast,
      successMessage: "User updated successfully",
      errorMessage: "Failed to update user",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.map((user) =>
            user.id === input.id
              ? { ...user, ...input, updatedAt: new Date() }
              : user,
          );
        },
      },
    },
  );
}

/**
 * Update an existing user (legacy, non-optimistic version)
 */
export function useUpdateUser(
  onSuccess?: (data: User) => void,
): MutationState<{ id: string } & Partial<User>> {
  return useMutation<{ id: string } & Partial<User>>(
    (data) => `${API_BASE}/users/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a user with optimistic update
 */
export function useDeleteUserOptimistic(
  options: Omit<UserOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  role?: UserRole | null,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getUsersStoreKey(role);
  const { setData, getCurrentData } = useDataStoreAccess<User[]>(storeKey);

  return useOptimisticMutation<User[], { id: string }, any>(
    (data) => `${API_BASE}/users/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "User deleted successfully",
      errorMessage: "Failed to delete user",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData) return [];
          return currentData.filter((user) => user.id !== input.id);
        },
      },
    },
  );
}

/**
 * Delete a user (legacy, non-optimistic version)
 */
export function useDeleteUser(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>((data) => `${API_BASE}/users/${data.id}`, {
    method: "DELETE",
    onSuccess,
  });
}
