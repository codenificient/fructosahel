import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, livestock } from "@/lib/db";
import { updateLivestockSchema } from "@/lib/validations/livestock";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/livestock/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const entry = await db.query.livestock.findFirst({
      where: eq(livestock.id, id),
    });

    if (!entry) {
      return notFound("Livestock");
    }

    return success(entry);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/livestock/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLivestockSchema.parse(body);

    const existing = await db.query.livestock.findFirst({
      where: eq(livestock.id, id),
    });

    if (!existing) {
      return notFound("Livestock");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.livestockType !== undefined)
      updateData.livestockType = validatedData.livestockType;
    if (validatedData.breed !== undefined)
      updateData.breed = validatedData.breed;
    if (validatedData.quantity !== undefined)
      updateData.quantity = validatedData.quantity;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;

    const [updatedLivestock] = await db
      .update(livestock)
      .set(updateData)
      .where(eq(livestock.id, id))
      .returning();

    return success(updatedLivestock);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/livestock/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.livestock.findFirst({
      where: eq(livestock.id, id),
    });

    if (!existing) {
      return notFound("Livestock");
    }

    await db.delete(livestock).where(eq(livestock.id, id));

    return success({ message: "Livestock entry deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
