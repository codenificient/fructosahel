import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, milestones } from "@/lib/db";
import { updateMilestoneSchema } from "@/lib/validations/roadmap";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/roadmap/milestones/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    });

    if (!milestone) {
      return notFound("Milestone");
    }

    return success(milestone);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/roadmap/milestones/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateMilestoneSchema.parse(body);

    const existing = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    });

    if (!existing) {
      return notFound("Milestone");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.category !== undefined)
      updateData.category = validatedData.category;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.targetDate !== undefined)
      updateData.targetDate = validatedData.targetDate;
    if (validatedData.completedDate !== undefined)
      updateData.completedDate = validatedData.completedDate;
    if (validatedData.sortOrder !== undefined)
      updateData.sortOrder = validatedData.sortOrder;

    const [updatedMilestone] = await db
      .update(milestones)
      .set(updateData)
      .where(eq(milestones.id, id))
      .returning();

    return success(updatedMilestone);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/roadmap/milestones/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    });

    if (!existing) {
      return notFound("Milestone");
    }

    await db.delete(milestones).where(eq(milestones.id, id));

    return success({ message: "Milestone deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
