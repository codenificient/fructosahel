import { NextRequest } from "next/server";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, transactions } from "@/lib/db";
import { createTransactionSchema } from "@/lib/validations/transactions";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/transactions - List all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions = [];
    if (farmId) conditions.push(eq(transactions.farmId, farmId));

    const allTransactions = await db.query.transactions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        farm: true,
        creator: true,
      },
      orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
    });

    // Additional filtering
    let filtered = allTransactions;
    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((t) => new Date(t.transactionDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((t) => new Date(t.transactionDate) <= end);
    }

    // Calculate totals
    const totals = {
      income: filtered
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      expense: filtered
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    };

    return success({
      transactions: filtered,
      totals: {
        ...totals,
        net: totals.income - totals.expense,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        farmId: validatedData.farmId,
        type: validatedData.type,
        category: validatedData.category,
        description: validatedData.description,
        amount: validatedData.amount.toString(),
        currency: validatedData.currency,
        transactionDate: validatedData.transactionDate,
        createdBy: validatedData.createdBy,
        attachmentUrl: validatedData.attachmentUrl,
      })
      .returning();

    return created(newTransaction);
  } catch (error) {
    return handleApiError(error);
  }
}
