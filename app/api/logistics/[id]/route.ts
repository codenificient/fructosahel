import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, logisticsOrders } from "@/lib/db";
import { updateLogisticsOrderSchema } from "@/lib/validations/logistics";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/logistics/:id
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const order = await db.query.logisticsOrders.findFirst({
      where: eq(logisticsOrders.id, id),
    });

    if (!order) return notFound("Logistics order");
    return success(order);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/logistics/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLogisticsOrderSchema.parse(body);

    const [updated] = await db
      .update(logisticsOrders)
      .set({
        ...validatedData,
        weightKg: validatedData.weightKg?.toString(),
        estimatedCostUsd: validatedData.estimatedCostUsd?.toString(),
        actualCostUsd: validatedData.actualCostUsd?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(logisticsOrders.id, id))
      .returning();

    if (!updated) return notFound("Logistics order");
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/logistics/:id
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(logisticsOrders)
      .where(eq(logisticsOrders.id, id))
      .returning();

    if (!deleted) return notFound("Logistics order");
    return success({ message: "Logistics order deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
