import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, roadmapPhases } from "@/lib/db";
import { createPhaseSchema } from "@/lib/validations/roadmap";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/roadmap/phases - List phases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const whereClause = farmId
      ? eq(roadmapPhases.farmId, farmId)
      : undefined;

    const phases = await db.query.roadmapPhases.findMany({
      where: whereClause,
      with: {
        milestones: {
          orderBy: (milestones, { asc }) => [asc(milestones.sortOrder)],
        },
      },
      orderBy: (phases, { asc }) => [asc(phases.phaseNumber)],
    });

    return success(phases);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/roadmap/phases - Create a new phase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPhaseSchema.parse(body);

    const [newPhase] = await db
      .insert(roadmapPhases)
      .values({
        farmId: validatedData.farmId,
        name: validatedData.name,
        description: validatedData.description,
        phaseNumber: validatedData.phaseNumber,
        status: validatedData.status,
        targetStartDate: validatedData.targetStartDate,
        targetEndDate: validatedData.targetEndDate,
        actualStartDate: validatedData.actualStartDate,
        actualEndDate: validatedData.actualEndDate,
        targetHectares: validatedData.targetHectares?.toString(),
        targetRevenueUsd: validatedData.targetRevenueUsd?.toString(),
        notes: validatedData.notes,
      })
      .returning();

    return created(newPhase);
  } catch (error) {
    return handleApiError(error);
  }
}
