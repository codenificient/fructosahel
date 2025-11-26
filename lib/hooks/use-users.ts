import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { User, NewUser, UserRole } from "@/types";

const API_BASE = "/api";

// Fetch users, optionally filtered by role
export function useUsers(role?: UserRole | null): FetchState<User[]> {
  const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
  return useFetch<User[]>(url);
}

// Fetch single user by ID
export function useUser(id: string | null): FetchState<User> {
  const url = id ? `${API_BASE}/users/${id}` : null;
  return useFetch<User>(url);
}

// Create a new user
export function useCreateUser(
  onSuccess?: (data: User) => void
): MutationState<NewUser> {
  return useMutation<NewUser>(`${API_BASE}/users`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing user
export function useUpdateUser(
  onSuccess?: (data: User) => void
): MutationState<{ id: string } & Partial<User>> {
  return useMutation<{ id: string } & Partial<User>>(
    (data) => `${API_BASE}/users/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    }
  );
}

// Delete a user
export function useDeleteUser(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/users/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
