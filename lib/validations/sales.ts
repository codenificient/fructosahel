import { z } from "zod";
import { cropTypeValues } from "./crops";

export const createSaleSchema = z.object({
  farmId: z.string().uuid("Farm ID is required"),
  cropType: z.enum(cropTypeValues),
  quantityKg: z.coerce.number().positive("Quantity must be positive"),
  pricePerKg: z.coerce.number().positive("Price must be positive"),
  totalAmount: z.coerce.number().positive().optional(),
  currency: z.string().max(10).default("XOF"),
  buyerName: z.string().max(255).optional(),
  buyerContact: z.string().max(255).optional(),
  saleDate: z.coerce.date().default(() => new Date()),
  notes: z.string().optional(),
  createdBy: z.string().uuid().optional(),
});

export const updateSaleSchema = createSaleSchema.partial().omit({ farmId: true, createdBy: true });

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
