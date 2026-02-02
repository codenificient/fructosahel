import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, notificationPreferences } from "@/lib/db";
import { handleApiError, success, created } from "@/lib/api/errors";
import { z } from "zod";

// Validation schema for notification preferences
const preferencesSchema = z.object({
  userId: z.string().uuid(),
  enabled: z.boolean().optional(),
  taskReminders: z.boolean().optional(),
  urgentAlerts: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  newTaskAssigned: z.boolean().optional(),
  taskOverdue: z.boolean().optional(),
  reminderHoursBefore: z.number().min(1).max(168).optional(), // 1 hour to 1 week
});

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const preferences = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });

    // Return default preferences if none exist
    if (!preferences) {
      return success({
        userId,
        enabled: true,
        taskReminders: true,
        urgentAlerts: true,
        dailyDigest: false,
        newTaskAssigned: true,
        taskOverdue: true,
        reminderHoursBefore: 24,
        isDefault: true,
      });
    }

    return success(preferences);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/notifications/preferences - Create notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    const { userId, ...preferences } = validatedData;

    // Check if preferences already exist
    const existing = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });

    if (existing) {
      // Update existing preferences
      const [updated] = await db
        .update(notificationPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning();

      return success(updated);
    }

    // Create new preferences
    const [newPreferences] = await db
      .insert(notificationPreferences)
      .values({
        userId,
        enabled: preferences.enabled ?? true,
        taskReminders: preferences.taskReminders ?? true,
        urgentAlerts: preferences.urgentAlerts ?? true,
        dailyDigest: preferences.dailyDigest ?? false,
        newTaskAssigned: preferences.newTaskAssigned ?? true,
        taskOverdue: preferences.taskOverdue ?? true,
        reminderHoursBefore: preferences.reminderHoursBefore ?? 24,
      })
      .returning();

    return created(newPreferences);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    const { userId, ...preferences } = validatedData;

    // Check if preferences exist
    const existing = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });

    if (!existing) {
      // Create new preferences if they don't exist
      const [newPreferences] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          enabled: preferences.enabled ?? true,
          taskReminders: preferences.taskReminders ?? true,
          urgentAlerts: preferences.urgentAlerts ?? true,
          dailyDigest: preferences.dailyDigest ?? false,
          newTaskAssigned: preferences.newTaskAssigned ?? true,
          taskOverdue: preferences.taskOverdue ?? true,
          reminderHoursBefore: preferences.reminderHoursBefore ?? 24,
        })
        .returning();

      return created(newPreferences);
    }

    // Update existing preferences
    const [updated] = await db
      .update(notificationPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning();

    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
