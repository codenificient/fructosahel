import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, logisticsOrders } from "@/lib/db";
import { createLogisticsOrderSchema } from "@/lib/validations/logistics";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/logistics - List logistics orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const whereClause = farmId
      ? eq(logisticsOrders.farmId, farmId)
      : undefined;

    const orders = await db.query.logisticsOrders.findMany({
      where: whereClause,
      orderBy: (logisticsOrders, { desc }) => [desc(logisticsOrders.createdAt)],
    });

    return success(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/logistics - Create a new logistics order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLogisticsOrderSchema.parse(body);

    const [newOrder] = await db
      .insert(logisticsOrders)
      .values({
        farmId: validatedData.farmId,
        orderType: validatedData.orderType,
        status: validatedData.status,
        origin: validatedData.origin,
        destination: validatedData.destination,
        cargoDescription: validatedData.cargoDescription,
        weightKg: validatedData.weightKg?.toString(),
        vehicleInfo: validatedData.vehicleInfo,
        estimatedCostUsd: validatedData.estimatedCostUsd?.toString(),
        actualCostUsd: validatedData.actualCostUsd?.toString(),
        scheduledDate: validatedData.scheduledDate,
        completedDate: validatedData.completedDate,
        notes: validatedData.notes,
      })
      .returning();

    return created(newOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
