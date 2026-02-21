import { z } from "zod";

export const cropTypeValues = [
  "pineapple",
  "cashew",
  "avocado",
  "mango",
  "banana",
  "papaya",
  "potato",
  "cowpea",
  "bambara_groundnut",
  "sorghum",
  "pearl_millet",
  "moringa",
  "sweet_potato",
  "onion",
  "rice",
  "tomato",
  "pepper",
  "okra",
  "peanut",
  "cassava",
  "pigeon_pea",
  "citrus",
  "guava",
] as const;
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
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateCropSchema = createCropSchema
  .partial()
  .omit({ fieldId: true });

export type CreateCropInput = z.infer<typeof createCropSchema>;
export type UpdateCropInput = z.infer<typeof updateCropSchema>;
