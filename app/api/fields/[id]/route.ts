import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, fields, cropActivities } from "@/lib/db";
import { updateFieldSchema } from "@/lib/validations/fields";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/fields/[id] - Get a single field
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Fetch field with first-level relations, then attach activities separately
    // (neon-http driver doesn't support 2+ levels of nested relations)
    const field = await db.query.fields.findFirst({
      where: eq(fields.id, id),
      with: {
        farm: true,
        crops: true,
      },
    });

    // Attach activities to each crop
    if (field?.crops?.length) {
      const allActivities = await Promise.all(
        field.crops.map((c) =>
          db.query.cropActivities.findMany({
            where: eq(cropActivities.cropId, c.id),
          }),
        ),
      );
      (field as Record<string, unknown>).crops = field.crops.map((c, i) => ({
        ...c,
        activities: allActivities[i] || [],
      }));
    }

    if (!field) {
      return notFound("Field");
    }

    return success(field);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/fields/[id] - Update a field
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFieldSchema.parse(body);

    const existing = await db.query.fields.findFirst({
      where: eq(fields.id, id),
    });

    if (!existing) {
      return notFound("Field");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.sizeHectares !== undefined)
      updateData.sizeHectares = validatedData.sizeHectares.toString();
    if (validatedData.soilType !== undefined)
      updateData.soilType = validatedData.soilType;
    if (validatedData.irrigationType !== undefined)
      updateData.irrigationType = validatedData.irrigationType;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;

    const [updatedField] = await db
      .update(fields)
      .set(updateData)
      .where(eq(fields.id, id))
      .returning();

    return success(updatedField);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/fields/[id] - Delete a field
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.fields.findFirst({
      where: eq(fields.id, id),
    });

    if (!existing) {
      return notFound("Field");
    }

    await db.delete(fields).where(eq(fields.id, id));

    return success({ message: "Field deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
