import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, trainingPrograms } from "@/lib/db";
import { createTrainingProgramSchema } from "@/lib/validations/training";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/training - List training programs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const whereClause = farmId
      ? eq(trainingPrograms.farmId, farmId)
      : undefined;

    const programs = await db.query.trainingPrograms.findMany({
      where: whereClause,
      with: {
        enrollments: true,
      },
      orderBy: (trainingPrograms, { desc }) => [desc(trainingPrograms.createdAt)],
    });

    return success(programs);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/training - Create a new training program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTrainingProgramSchema.parse(body);

    const [newProgram] = await db
      .insert(trainingPrograms)
      .values({
        farmId: validatedData.farmId,
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        location: validatedData.location,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        maxParticipants: validatedData.maxParticipants,
        curriculumAreas: validatedData.curriculumAreas,
        durationWeeks: validatedData.durationWeeks,
        notes: validatedData.notes,
      })
      .returning();

    return created(newProgram);
  } catch (error) {
    return handleApiError(error);
  }
}
