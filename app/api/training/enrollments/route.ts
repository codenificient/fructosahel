import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, trainingEnrollments } from "@/lib/db";
import { createEnrollmentSchema } from "@/lib/validations/training";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/training/enrollments - List enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    const whereClause = programId
      ? eq(trainingEnrollments.programId, programId)
      : undefined;

    const enrollments = await db.query.trainingEnrollments.findMany({
      where: whereClause,
      orderBy: (trainingEnrollments, { desc }) => [desc(trainingEnrollments.enrolledAt)],
    });

    return success(enrollments);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/training/enrollments - Create a new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEnrollmentSchema.parse(body);

    const [newEnrollment] = await db
      .insert(trainingEnrollments)
      .values({
        programId: validatedData.programId,
        participantName: validatedData.participantName,
        participantAge: validatedData.participantAge,
        participantPhone: validatedData.participantPhone,
        homeVillage: validatedData.homeVillage,
        status: validatedData.status,
        notes: validatedData.notes,
      })
      .returning();

    return created(newEnrollment);
  } catch (error) {
    return handleApiError(error);
  }
}
