import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, tasks } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validations/tasks";
import { handleApiError, success, notFound } from "@/lib/api/errors";
import { notifyNewTaskAssigned } from "@/lib/services/notification-service";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id] - Get a single task
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        farm: true,
        crop: {
          with: {
            field: true,
          },
        },
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      return notFound("Task");
    }

    return success(task);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!existing) {
      return notFound("Task");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.farmId !== undefined)
      updateData.farmId = validatedData.farmId;
    if (validatedData.cropId !== undefined)
      updateData.cropId = validatedData.cropId;
    if (validatedData.assignedTo !== undefined)
      updateData.assignedTo = validatedData.assignedTo;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (validatedData.status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (validatedData.priority !== undefined)
      updateData.priority = validatedData.priority;
    if (validatedData.dueDate !== undefined)
      updateData.dueDate = validatedData.dueDate;
    if (validatedData.completedAt !== undefined)
      updateData.completedAt = validatedData.completedAt;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    // Send notification if task is being assigned to a new person
    if (
      validatedData.assignedTo !== undefined &&
      validatedData.assignedTo !== existing.assignedTo &&
      validatedData.assignedTo !== null
    ) {
      // Fire and forget - don't block the response
      notifyNewTaskAssigned(
        updatedTask.id,
        updatedTask.title,
        validatedData.assignedTo,
        updatedTask.priority,
      ).catch((error) => {
        console.error("Failed to send task reassignment notification:", error);
      });
    }

    return success(updatedTask);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!existing) {
      return notFound("Task");
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return success({ message: "Task deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
