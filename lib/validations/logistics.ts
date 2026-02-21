import { z } from "zod";

export const logisticsOrderTypeValues = [
  "distribution",
  "storage",
  "processing_transport",
  "solar_installation",
  "equipment_delivery",
] as const;

export const logisticsStatusValues = [
  "pending",
  "scheduled",
  "in_transit",
  "delivered",
  "stored",
  "cancelled",
] as const;

export const createLogisticsOrderSchema = z.object({
  farmId: z.string().uuid("Invalid farm ID").optional(),
  orderType: z.enum(logisticsOrderTypeValues),
  status: z.enum(logisticsStatusValues).default("pending"),
  origin: z.string().min(1).max(255),
  destination: z.string().min(1).max(255),
  cargoDescription: z.string().optional(),
  weightKg: z.coerce.number().positive().optional(),
  vehicleInfo: z.string().max(255).optional(),
  estimatedCostUsd: z.coerce.number().positive().optional(),
  actualCostUsd: z.coerce.number().positive().optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateLogisticsOrderSchema = createLogisticsOrderSchema
  .partial()
  .omit({ farmId: true });

export type CreateLogisticsOrderInput = z.infer<typeof createLogisticsOrderSchema>;
export type UpdateLogisticsOrderInput = z.infer<typeof updateLogisticsOrderSchema>;
