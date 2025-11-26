import { z } from "zod";

export const transactionTypeValues = ["income", "expense"] as const;

export const createTransactionSchema = z.object({
  farmId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues),
  category: z.string().min(1, "Category is required").max(100),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().max(10).default("XOF"),
  transactionDate: z.coerce.date().default(() => new Date()),
  createdBy: z.string().uuid().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial().omit({ createdBy: true });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
