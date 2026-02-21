import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, trainingEnrollments } from "@/lib/db";
import { updateEnrollmentSchema } from "@/lib/validations/training";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/training/enrollments/:id
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const enrollment = await db.query.trainingEnrollments.findFirst({
      where: eq(trainingEnrollments.id, id),
    });

    if (!enrollment) return notFound("Enrollment");
    return success(enrollment);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/training/enrollments/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEnrollmentSchema.parse(body);

    const [updated] = await db
      .update(trainingEnrollments)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(trainingEnrollments.id, id))
      .returning();

    if (!updated) return notFound("Enrollment");
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/training/enrollments/:id
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(trainingEnrollments)
      .where(eq(trainingEnrollments.id, id))
      .returning();

    if (!deleted) return notFound("Enrollment");
    return success({ message: "Enrollment deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
