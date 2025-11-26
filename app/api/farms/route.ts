import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, farms } from "@/lib/db";
import { createFarmSchema } from "@/lib/validations/farms";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/farms - List all farms
export async function GET() {
  try {
    const allFarms = await db.query.farms.findMany({
      with: {
        manager: true,
        fields: true,
      },
      orderBy: (farms, { desc }) => [desc(farms.createdAt)],
    });

    return success(allFarms);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/farms - Create a new farm
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createFarmSchema.parse(body);

    const [newFarm] = await db
      .insert(farms)
      .values({
        name: validatedData.name,
        location: validatedData.location,
        country: validatedData.country,
        sizeHectares: validatedData.sizeHectares.toString(),
        latitude: validatedData.latitude?.toString(),
        longitude: validatedData.longitude?.toString(),
        description: validatedData.description,
        managerId: validatedData.managerId,
      })
      .returning();

    return created(newFarm);
  } catch (error) {
    return handleApiError(error);
  }
}
