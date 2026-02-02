import { NextRequest } from "next/server";
import { eq, and, or } from "drizzle-orm";
import { db, tasks } from "@/lib/db";
import { createTaskSchema } from "@/lib/validations/tasks";
import { handleApiError, success, created } from "@/lib/api/errors";
import { notifyNewTaskAssigned } from "@/lib/services/notification-service";

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const conditions = [];
    if (farmId) conditions.push(eq(tasks.farmId, farmId));
    if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo));

    const allTasks = await db.query.tasks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        farm: true,
        crop: true,
        assignee: true,
        creator: true,
      },
      orderBy: (tasks, { desc, asc }) => [
        asc(tasks.status),
        desc(tasks.priority),
        asc(tasks.dueDate),
      ],
    });

    // Additional filtering
    let filteredTasks = allTasks;
    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter((t) => t.priority === priority);
    }

    return success(filteredTasks);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const [newTask] = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        farmId: validatedData.farmId,
        cropId: validatedData.cropId,
        assignedTo: validatedData.assignedTo,
        createdBy: validatedData.createdBy,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate,
      })
      .returning();

    // Send notification if task is assigned to someone
    if (validatedData.assignedTo) {
      // Fire and forget - don't block the response
      notifyNewTaskAssigned(
        newTask.id,
        newTask.title,
        validatedData.assignedTo,
        validatedData.priority || "medium",
      ).catch((error) => {
        console.error("Failed to send task notification:", error);
      });
    }

    return created(newTask);
  } catch (error) {
    return handleApiError(error);
  }
}
