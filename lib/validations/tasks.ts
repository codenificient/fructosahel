import { z } from "zod";

export const taskStatusValues = ["pending", "in_progress", "completed", "cancelled"] as const;
export const taskPriorityValues = ["low", "medium", "high", "urgent"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  farmId: z.string().uuid().optional(),
  cropId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  createdBy: z.string().uuid("Creator ID is required"),
  status: z.enum(taskStatusValues).default("pending"),
  priority: z.enum(taskPriorityValues).default("medium"),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  farmId: z.string().uuid().nullable().optional(),
  cropId: z.string().uuid().nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
