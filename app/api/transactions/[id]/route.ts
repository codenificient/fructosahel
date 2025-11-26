import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, transactions } from "@/lib/db";
import { updateTransactionSchema } from "@/lib/validations/transactions";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/transactions/[id] - Get a single transaction
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: {
        farm: true,
        creator: true,
      },
    });

    if (!transaction) {
      return notFound("Transaction");
    }

    return success(transaction);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/transactions/[id] - Update a transaction
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);

    const existing = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });

    if (!existing) {
      return notFound("Transaction");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.farmId !== undefined) updateData.farmId = validatedData.farmId;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount.toString();
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
    if (validatedData.transactionDate !== undefined) updateData.transactionDate = validatedData.transactionDate;
    if (validatedData.attachmentUrl !== undefined) updateData.attachmentUrl = validatedData.attachmentUrl;

    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    return success(updatedTransaction);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });

    if (!existing) {
      return notFound("Transaction");
    }

    await db.delete(transactions).where(eq(transactions.id, id));

    return success({ message: "Transaction deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
