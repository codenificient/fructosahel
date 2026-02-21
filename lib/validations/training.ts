import { z } from "zod";

export const trainingStatusValues = [
  "planning",
  "enrolling",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const enrollmentStatusValues = [
  "applied",
  "enrolled",
  "in_progress",
  "completed",
  "dropped",
] as const;

export const createTrainingProgramSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID").optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(trainingStatusValues).default("planning"),
  location: z.string().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxParticipants: z.coerce.number().int().positive().optional(),
  curriculumAreas: z.array(z.string()).optional(),
  durationWeeks: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const updateTrainingProgramSchema = createTrainingProgramSchema
  .partial()
  .omit({ farmId: true });

export const createEnrollmentSchema = z.object({
  programId: z.string().uuid("Invalid program ID"),
  participantName: z.string().min(1).max(255),
  participantAge: z.coerce.number().int().min(14).max(65).optional(),
  participantPhone: z.string().max(50).optional(),
  homeVillage: z.string().max(255).optional(),
  status: z.enum(enrollmentStatusValues).default("applied"),
  notes: z.string().optional(),
});

export const updateEnrollmentSchema = createEnrollmentSchema
  .partial()
  .omit({ programId: true });

export type CreateTrainingProgramInput = z.infer<typeof createTrainingProgramSchema>;
export type UpdateTrainingProgramInput = z.infer<typeof updateTrainingProgramSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
