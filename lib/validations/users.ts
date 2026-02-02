import { z } from "zod";

export const userRoleValues = ["admin", "manager", "worker", "viewer"] as const;

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  name: z.string().min(1, "Name is required").max(255),
  role: z.enum(userRoleValues).default("viewer"),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(50).optional(),
  language: z.enum(["en", "fr"]).default("en"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
