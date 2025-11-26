import { z } from "zod";

export const createFieldSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID"),
  name: z.string().min(1, "Name is required").max(255),
  sizeHectares: z.coerce.number().positive("Size must be positive"),
  soilType: z.string().max(100).optional(),
  irrigationType: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const updateFieldSchema = createFieldSchema.partial().omit({ farmId: true });

export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
