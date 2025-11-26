import { z } from "zod";

export const countryValues = ["burkina_faso", "mali", "niger"] as const;

export const createFarmSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  location: z.string().min(1, "Location is required").max(255),
  country: z.enum(countryValues),
  sizeHectares: z.coerce.number().positive("Size must be positive"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
});

export const updateFarmSchema = createFarmSchema.partial();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
