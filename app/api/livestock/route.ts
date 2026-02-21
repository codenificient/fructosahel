import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, livestock } from "@/lib/db";
import { createLivestockSchema } from "@/lib/validations/livestock";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/livestock - List livestock
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const whereClause = farmId
      ? eq(livestock.farmId, farmId)
      : undefined;

    const allLivestock = await db.query.livestock.findMany({
      where: whereClause,
      orderBy: (livestock, { desc }) => [desc(livestock.createdAt)],
    });

    return success(allLivestock);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/livestock - Create a new livestock entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLivestockSchema.parse(body);

    const [newLivestock] = await db
      .insert(livestock)
      .values({
        farmId: validatedData.farmId,
        livestockType: validatedData.livestockType,
        breed: validatedData.breed,
        quantity: validatedData.quantity,
        notes: validatedData.notes,
      })
      .returning();

    return created(newLivestock);
  } catch (error) {
    return handleApiError(error);
  }
}
