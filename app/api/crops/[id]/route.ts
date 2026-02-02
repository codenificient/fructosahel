import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, crops } from "@/lib/db";
import { updateCropSchema } from "@/lib/validations/crops";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/crops/[id] - Get a single crop
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const crop = await db.query.crops.findFirst({
      where: eq(crops.id, id),
      with: {
        field: {
          with: {
            farm: true,
          },
        },
        activities: {
          orderBy: (activities, { desc }) => [desc(activities.performedAt)],
        },
        tasks: true,
      },
    });

    if (!crop) {
      return notFound("Crop");
    }

    return success(crop);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/crops/[id] - Update a crop
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCropSchema.parse(body);

    const existing = await db.query.crops.findFirst({
      where: eq(crops.id, id),
    });

    if (!existing) {
      return notFound("Crop");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.cropType !== undefined)
      updateData.cropType = validatedData.cropType;
    if (validatedData.variety !== undefined)
      updateData.variety = validatedData.variety;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.plantingDate !== undefined)
      updateData.plantingDate = validatedData.plantingDate;
    if (validatedData.expectedHarvestDate !== undefined)
      updateData.expectedHarvestDate = validatedData.expectedHarvestDate;
    if (validatedData.actualHarvestDate !== undefined)
      updateData.actualHarvestDate = validatedData.actualHarvestDate;
    if (validatedData.numberOfPlants !== undefined)
      updateData.numberOfPlants = validatedData.numberOfPlants;
    if (validatedData.expectedYieldKg !== undefined)
      updateData.expectedYieldKg = validatedData.expectedYieldKg?.toString();
    if (validatedData.actualYieldKg !== undefined)
      updateData.actualYieldKg = validatedData.actualYieldKg?.toString();
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;
    if (validatedData.imageUrl !== undefined)
      updateData.imageUrl = validatedData.imageUrl || null;

    const [updatedCrop] = await db
      .update(crops)
      .set(updateData)
      .where(eq(crops.id, id))
      .returning();

    return success(updatedCrop);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/crops/[id] - Delete a crop
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.crops.findFirst({
      where: eq(crops.id, id),
    });

    if (!existing) {
      return notFound("Crop");
    }

    await db.delete(crops).where(eq(crops.id, id));

    return success({ message: "Crop deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
