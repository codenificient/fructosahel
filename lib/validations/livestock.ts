import { z } from "zod";

export const livestockTypeValues = [
  "chickens",
  "guinea_fowl",
  "ducks",
  "sheep",
  "pigs",
] as const;

export const createLivestockSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID"),
  livestockType: z.enum(livestockTypeValues),
  breed: z.string().max(100).optional(),
  quantity: z.coerce.number().int().positive(),
  notes: z.string().optional(),
});

export const updateLivestockSchema = createLivestockSchema
  .partial()
  .omit({ farmId: true });

export type CreateLivestockInput = z.infer<typeof createLivestockSchema>;
export type UpdateLivestockInput = z.infer<typeof updateLivestockSchema>;
