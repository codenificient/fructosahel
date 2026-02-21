import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, trainingPrograms } from "@/lib/db";
import { updateTrainingProgramSchema } from "@/lib/validations/training";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/training/:id
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const program = await db.query.trainingPrograms.findFirst({
      where: eq(trainingPrograms.id, id),
      with: {
        enrollments: true,
      },
    });

    if (!program) return notFound("Training program");
    return success(program);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/training/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTrainingProgramSchema.parse(body);

    const [updated] = await db
      .update(trainingPrograms)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(trainingPrograms.id, id))
      .returning();

    if (!updated) return notFound("Training program");
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/training/:id
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(trainingPrograms)
      .where(eq(trainingPrograms.id, id))
      .returning();

    if (!deleted) return notFound("Training program");
    return success({ message: "Training program deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
