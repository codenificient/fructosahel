import { z } from "zod";

export const phaseStatusValues = [
  "not_started",
  "in_progress",
  "completed",
  "on_hold",
] as const;

export const milestoneStatusValues = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export const milestoneCategoryValues = [
  "infrastructure",
  "crops",
  "livestock",
  "equipment",
  "processing",
  "financial",
  "other",
] as const;

export const createPhaseSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  phaseNumber: z.coerce.number().int().positive(),
  status: z.enum(phaseStatusValues).default("not_started"),
  targetStartDate: z.coerce.date().optional(),
  targetEndDate: z.coerce.date().optional(),
  actualStartDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  targetHectares: z.coerce.number().positive().optional(),
  targetRevenueUsd: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
});

export const updatePhaseSchema = createPhaseSchema
  .partial()
  .omit({ farmId: true });

export const createMilestoneSchema = z.object({
  phaseId: z.string().uuid("Invalid phase ID"),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(milestoneCategoryValues).default("other"),
  status: z.enum(milestoneStatusValues).default("not_started"),
  targetDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const updateMilestoneSchema = createMilestoneSchema
  .partial()
  .omit({ phaseId: true });

export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
