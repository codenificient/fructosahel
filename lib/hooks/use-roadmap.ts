"use client";

import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type {
  RoadmapPhase,
  NewRoadmapPhase,
  Milestone,
  NewMilestone,
} from "@/types";

const API_BASE = "/api";

/**
 * Fetch phases with optional farmId filter
 */
export function usePhases(farmId?: string): FetchState<RoadmapPhase[]> {
  const query = farmId ? `?farmId=${farmId}` : "";
  return useFetch<RoadmapPhase[]>(`${API_BASE}/roadmap/phases${query}`, {
    cacheKey: farmId ? `phases:farm:${farmId}` : "phases:all",
    cacheType: "phases",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch single phase by ID
 */
export function usePhase(id: string | null): FetchState<RoadmapPhase> {
  const url = id ? `${API_BASE}/roadmap/phases/${id}` : null;
  return useFetch<RoadmapPhase>(url, {
    cacheKey: id ? `phases:${id}` : undefined,
    cacheType: "phases",
    staleWhileRevalidate: true,
  });
}

/**
 * Fetch milestones with optional phaseId filter
 */
export function useMilestones(phaseId?: string): FetchState<Milestone[]> {
  const query = phaseId ? `?phaseId=${phaseId}` : "";
  return useFetch<Milestone[]>(`${API_BASE}/roadmap/milestones${query}`, {
    cacheKey: phaseId ? `milestones:phase:${phaseId}` : "milestones:all",
    cacheType: "milestones",
    staleWhileRevalidate: true,
  });
}

/**
 * Create a new phase
 */
export function useCreatePhase(
  onSuccess?: (data: RoadmapPhase) => void,
): MutationState<NewRoadmapPhase> {
  return useMutation<NewRoadmapPhase>(`${API_BASE}/roadmap/phases`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing phase
 */
export function useUpdatePhase(
  onSuccess?: (data: RoadmapPhase) => void,
): MutationState<{ id: string } & Partial<RoadmapPhase>> {
  return useMutation<{ id: string } & Partial<RoadmapPhase>>(
    (data) => `${API_BASE}/roadmap/phases/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a phase
 */
export function useDeletePhase(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/roadmap/phases/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}

/**
 * Create a new milestone
 */
export function useCreateMilestone(
  onSuccess?: (data: Milestone) => void,
): MutationState<NewMilestone> {
  return useMutation<NewMilestone>(`${API_BASE}/roadmap/milestones`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing milestone
 */
export function useUpdateMilestone(
  onSuccess?: (data: Milestone) => void,
): MutationState<{ id: string } & Partial<Milestone>> {
  return useMutation<{ id: string } & Partial<Milestone>>(
    (data) => `${API_BASE}/roadmap/milestones/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a milestone
 */
export function useDeleteMilestone(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/roadmap/milestones/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
