"use client";

import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type {
  TrainingProgram,
  NewTrainingProgram,
  TrainingEnrollment,
  NewTrainingEnrollment,
} from "@/types";

const API_BASE = "/api";

/**
 * Fetch training programs with optional farmId filter
 */
export function useTrainingPrograms(farmId?: string): FetchState<TrainingProgram[]> {
  const query = farmId ? `?farmId=${farmId}` : "";
  return useFetch<TrainingProgram[]>(`${API_BASE}/training${query}`, {
    cacheKey: farmId ? `training:farm:${farmId}` : "training:all",
    cacheType: "training",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch a single training program
 */
export function useTrainingProgram(id: string): FetchState<TrainingProgram> {
  return useFetch<TrainingProgram>(`${API_BASE}/training/${id}`, {
    cacheKey: `training:${id}`,
    cacheType: "training",
  });
}

/**
 * Create a new training program
 */
export function useCreateTrainingProgram(
  onSuccess?: (data: TrainingProgram) => void,
): MutationState<NewTrainingProgram> {
  return useMutation<NewTrainingProgram>(`${API_BASE}/training`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing training program
 */
export function useUpdateTrainingProgram(
  onSuccess?: (data: TrainingProgram) => void,
): MutationState<{ id: string } & Partial<TrainingProgram>> {
  return useMutation<{ id: string } & Partial<TrainingProgram>>(
    (data) => `${API_BASE}/training/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a training program
 */
export function useDeleteTrainingProgram(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/training/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}

/**
 * Fetch enrollments for a program
 */
export function useEnrollments(programId?: string): FetchState<TrainingEnrollment[]> {
  const query = programId ? `?programId=${programId}` : "";
  return useFetch<TrainingEnrollment[]>(`${API_BASE}/training/enrollments${query}`, {
    cacheKey: programId ? `enrollments:program:${programId}` : "enrollments:all",
    cacheType: "enrollments",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new enrollment
 */
export function useCreateEnrollment(
  onSuccess?: (data: TrainingEnrollment) => void,
): MutationState<NewTrainingEnrollment> {
  return useMutation<NewTrainingEnrollment>(`${API_BASE}/training/enrollments`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an enrollment
 */
export function useUpdateEnrollment(
  onSuccess?: (data: TrainingEnrollment) => void,
): MutationState<{ id: string } & Partial<TrainingEnrollment>> {
  return useMutation<{ id: string } & Partial<TrainingEnrollment>>(
    (data) => `${API_BASE}/training/enrollments/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete an enrollment
 */
export function useDeleteEnrollment(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/training/enrollments/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
