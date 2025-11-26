import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { createUserSchema } from "@/lib/validations/users";
import { handleApiError, success, created, ApiError } from "@/lib/api/errors";

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const allUsers = await db.query.users.findMany({
      with: {
        managedFarms: true,
        tasks: {
          limit: 5,
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        },
      },
      orderBy: (users, { asc }) => [asc(users.name)],
    });

    // Filter by role if specified
    let filtered = allUsers;
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    return success(filtered);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      throw new ApiError(409, "A user with this email already exists");
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        avatarUrl: validatedData.avatarUrl,
        phone: validatedData.phone,
        language: validatedData.language,
      })
      .returning();

    return created(newUser);
  } catch (error) {
    return handleApiError(error);
  }
}
