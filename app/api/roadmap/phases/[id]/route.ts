import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, roadmapPhases } from "@/lib/db";
import { updatePhaseSchema } from "@/lib/validations/roadmap";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/roadmap/phases/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const phase = await db.query.roadmapPhases.findFirst({
      where: eq(roadmapPhases.id, id),
      with: {
        milestones: {
          orderBy: (milestones, { asc }) => [asc(milestones.sortOrder)],
        },
      },
    });

    if (!phase) {
      return notFound("Phase");
    }

    return success(phase);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/roadmap/phases/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePhaseSchema.parse(body);

    const existing = await db.query.roadmapPhases.findFirst({
      where: eq(roadmapPhases.id, id),
    });

    if (!existing) {
      return notFound("Phase");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.phaseNumber !== undefined)
      updateData.phaseNumber = validatedData.phaseNumber;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.targetStartDate !== undefined)
      updateData.targetStartDate = validatedData.targetStartDate;
    if (validatedData.targetEndDate !== undefined)
      updateData.targetEndDate = validatedData.targetEndDate;
    if (validatedData.actualStartDate !== undefined)
      updateData.actualStartDate = validatedData.actualStartDate;
    if (validatedData.actualEndDate !== undefined)
      updateData.actualEndDate = validatedData.actualEndDate;
    if (validatedData.targetHectares !== undefined)
      updateData.targetHectares = validatedData.targetHectares?.toString();
    if (validatedData.targetRevenueUsd !== undefined)
      updateData.targetRevenueUsd = validatedData.targetRevenueUsd?.toString();
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const [updatedPhase] = await db
      .update(roadmapPhases)
      .set(updateData)
      .where(eq(roadmapPhases.id, id))
      .returning();

    return success(updatedPhase);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/roadmap/phases/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.roadmapPhases.findFirst({
      where: eq(roadmapPhases.id, id),
    });

    if (!existing) {
      return notFound("Phase");
    }

    await db.delete(roadmapPhases).where(eq(roadmapPhases.id, id));

    return success({ message: "Phase deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
