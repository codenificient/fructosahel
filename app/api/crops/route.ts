import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, crops } from "@/lib/db";
import { createCropSchema } from "@/lib/validations/crops";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/crops - List all crops
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get("fieldId");
    const cropType = searchParams.get("cropType");
    const status = searchParams.get("status");

    let whereClause = undefined;
    if (fieldId) {
      whereClause = eq(crops.fieldId, fieldId);
    }

    const allCrops = await db.query.crops.findMany({
      where: whereClause,
      with: {
        field: {
          with: {
            farm: true,
          },
        },
        activities: {
          limit: 5,
          orderBy: (activities, { desc }) => [desc(activities.performedAt)],
        },
      },
      orderBy: (crops, { desc }) => [desc(crops.createdAt)],
    });

    // Additional filtering
    let filteredCrops = allCrops;
    if (cropType) {
      filteredCrops = filteredCrops.filter((c) => c.cropType === cropType);
    }
    if (status) {
      filteredCrops = filteredCrops.filter((c) => c.status === status);
    }

    return success(filteredCrops);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/crops - Create a new crop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCropSchema.parse(body);

    const [newCrop] = await db
      .insert(crops)
      .values({
        fieldId: validatedData.fieldId,
        cropType: validatedData.cropType,
        variety: validatedData.variety,
        status: validatedData.status,
        plantingDate: validatedData.plantingDate,
        expectedHarvestDate: validatedData.expectedHarvestDate,
        actualHarvestDate: validatedData.actualHarvestDate,
        numberOfPlants: validatedData.numberOfPlants,
        expectedYieldKg: validatedData.expectedYieldKg?.toString(),
        actualYieldKg: validatedData.actualYieldKg?.toString(),
        notes: validatedData.notes,
      })
      .returning();

    return created(newCrop);
  } catch (error) {
    return handleApiError(error);
  }
}
