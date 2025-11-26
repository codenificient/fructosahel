import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, fields } from "@/lib/db";
import { createFieldSchema } from "@/lib/validations/fields";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/fields - List all fields
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    const query = db.query.fields.findMany({
      where: farmId ? eq(fields.farmId, farmId) : undefined,
      with: {
        farm: true,
        crops: true,
      },
      orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    });

    const allFields = await query;
    return success(allFields);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/fields - Create a new field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createFieldSchema.parse(body);

    const [newField] = await db
      .insert(fields)
      .values({
        farmId: validatedData.farmId,
        name: validatedData.name,
        sizeHectares: validatedData.sizeHectares.toString(),
        soilType: validatedData.soilType,
        irrigationType: validatedData.irrigationType,
        notes: validatedData.notes,
      })
      .returning();

    return created(newField);
  } catch (error) {
    return handleApiError(error);
  }
}
