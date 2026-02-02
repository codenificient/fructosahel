import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { updateUserSchema } from "@/lib/validations/users";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] - Get a single user
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        managedFarms: {
          with: {
            fields: true,
          },
        },
        tasks: {
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        },
        conversations: {
          orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
          limit: 10,
        },
      },
    });

    if (!user) {
      return notFound("User");
    }

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      return notFound("User");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.avatarUrl !== undefined)
      updateData.avatarUrl = validatedData.avatarUrl;
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone;
    if (validatedData.language !== undefined)
      updateData.language = validatedData.language;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return success(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      return notFound("User");
    }

    // Note: This will fail if user has related records due to FK constraints
    // Consider soft delete or handling related records first
    await db.delete(users).where(eq(users.id, id));

    return success({ message: "User deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
