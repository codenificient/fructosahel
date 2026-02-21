import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, milestones } from "@/lib/db";
import { createMilestoneSchema } from "@/lib/validations/roadmap";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/roadmap/milestones - List milestones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get("phaseId");

    const whereClause = phaseId
      ? eq(milestones.phaseId, phaseId)
      : undefined;

    const allMilestones = await db.query.milestones.findMany({
      where: whereClause,
      orderBy: (milestones, { asc }) => [asc(milestones.sortOrder)],
    });

    return success(allMilestones);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/roadmap/milestones - Create a new milestone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMilestoneSchema.parse(body);

    const [newMilestone] = await db
      .insert(milestones)
      .values({
        phaseId: validatedData.phaseId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        status: validatedData.status,
        targetDate: validatedData.targetDate,
        completedDate: validatedData.completedDate,
        sortOrder: validatedData.sortOrder ?? 0,
      })
      .returning();

    return created(newMilestone);
  } catch (error) {
    return handleApiError(error);
  }
}
