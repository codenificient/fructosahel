import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, farms, crops } from "@/lib/db";
import { updateFarmSchema } from "@/lib/validations/farms";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/farms/[id] - Get a single farm
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Fetch farm with first-level relations, then attach crops separately
    // (neon-http driver doesn't support 2+ levels of nested relations)
    const farm = await db.query.farms.findFirst({
      where: eq(farms.id, id),
      with: {
        manager: true,
        fields: true,
        tasks: true,
        transactions: true,
        sales: true,
      },
    });

    // Attach crops to each field
    if (farm?.fields?.length) {
      const allCrops = await Promise.all(
        farm.fields.map((f) =>
          db.query.crops.findMany({ where: eq(crops.fieldId, f.id) }),
        ),
      );
      (farm as Record<string, unknown>).fields = farm.fields.map((f, i) => ({
        ...f,
        crops: allCrops[i] || [],
      }));
    }

    if (!farm) {
      return notFound("Farm");
    }

    return success(farm);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/farms/[id] - Update a farm
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFarmSchema.parse(body);

    const existing = await db.query.farms.findFirst({
      where: eq(farms.id, id),
    });

    if (!existing) {
      return notFound("Farm");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.location !== undefined)
      updateData.location = validatedData.location;
    if (validatedData.country !== undefined)
      updateData.country = validatedData.country;
    if (validatedData.sizeHectares !== undefined)
      updateData.sizeHectares = validatedData.sizeHectares.toString();
    if (validatedData.latitude !== undefined)
      updateData.latitude = validatedData.latitude?.toString();
    if (validatedData.longitude !== undefined)
      updateData.longitude = validatedData.longitude?.toString();
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.managerId !== undefined)
      updateData.managerId = validatedData.managerId;

    const [updatedFarm] = await db
      .update(farms)
      .set(updateData)
      .where(eq(farms.id, id))
      .returning();

    return success(updatedFarm);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/farms/[id] - Delete a farm
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.farms.findFirst({
      where: eq(farms.id, id),
    });

    if (!existing) {
      return notFound("Farm");
    }

    await db.delete(farms).where(eq(farms.id, id));

    return success({ message: "Farm deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
