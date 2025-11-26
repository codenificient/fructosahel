import { z } from "zod";

export const cropTypeValues = ["pineapple", "cashew", "avocado", "mango", "banana", "papaya"] as const;
export const cropStatusValues = [
  "planning",
  "planted",
  "growing",
  "flowering",
  "fruiting",
  "harvesting",
  "harvested",
  "dormant",
] as const;

export const createCropSchema = z.object({
  fieldId: z.string().uuid("Invalid field ID"),
  cropType: z.enum(cropTypeValues),
  variety: z.string().max(100).optional(),
  status: z.enum(cropStatusValues).default("planning"),
  plantingDate: z.coerce.date().optional(),
  expectedHarvestDate: z.coerce.date().optional(),
  actualHarvestDate: z.coerce.date().optional(),
  numberOfPlants: z.coerce.number().int().positive().optional(),
  expectedYieldKg: z.coerce.number().positive().optional(),
  actualYieldKg: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateCropSchema = createCropSchema.partial().omit({ fieldId: true });

export type CreateCropInput = z.infer<typeof createCropSchema>;
export type UpdateCropInput = z.infer<typeof updateCropSchema>;
