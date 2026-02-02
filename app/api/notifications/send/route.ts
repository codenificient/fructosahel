import { NextRequest } from "next/server";
import { eq, and, lt, gte, inArray } from "drizzle-orm";
import webpush from "web-push";
import {
  db,
  pushSubscriptions,
  notificationPreferences,
  tasks,
  users,
} from "@/lib/db";
import { handleApiError, success } from "@/lib/api/errors";
import { z } from "zod";
import {
  createNotificationPayload,
  type NotificationType,
} from "@/lib/utils/notifications";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject =
  process.env.VAPID_SUBJECT || "mailto:admin@fructosahel.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Validation schema for sending notifications
const sendNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  userIds: z.array(z.string().uuid()).optional(),
  type: z.enum([
    "task_due_soon",
    "task_overdue",
    "urgent_task_assigned",
    "new_task_assigned",
    "daily_digest",
  ]),
  data: z.record(z.string(), z.unknown()),
});

// Helper function to send push notification to a subscription
async function sendPushToSubscription(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: object,
): Promise<{ success: boolean; endpoint: string; error?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return {
      success: false,
      endpoint: subscription.endpoint,
      error: "VAPID keys not configured",
    };
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload), {
      TTL: 60 * 60, // 1 hour
      urgency: "high",
    });
    return { success: true, endpoint: subscription.endpoint };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Failed to send push to ${subscription.endpoint}:`,
      errorMessage,
    );

    // If subscription is invalid, it should be cleaned up
    if (error instanceof webpush.WebPushError && error.statusCode === 410) {
      // Subscription expired - remove it
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
    }

    return {
      success: false,
      endpoint: subscription.endpoint,
      error: errorMessage,
    };
  }
}

// POST /api/notifications/send - Send push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendNotificationSchema.parse(body);

    const { userId, userIds, type, data } = validatedData;

    // Determine target users
    let targetUserIds: string[] = [];
    if (userId) {
      targetUserIds = [userId];
    } else if (userIds && userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      return new Response(
        JSON.stringify({ error: "Either userId or userIds is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Get notification preferences for target users
    const preferences = await db.query.notificationPreferences.findMany({
      where: inArray(notificationPreferences.userId, targetUserIds),
    });

    // Filter users based on their preferences
    const filteredUserIds = targetUserIds.filter((uid) => {
      const userPrefs = preferences.find((p) => p.userId === uid);

      // If no preferences exist, default to enabled
      if (!userPrefs) return true;

      // Check if notifications are enabled
      if (!userPrefs.enabled) return false;

      // Check specific notification type preferences
      switch (type) {
        case "task_due_soon":
          return userPrefs.taskReminders;
        case "task_overdue":
          return userPrefs.taskOverdue;
        case "urgent_task_assigned":
          return userPrefs.urgentAlerts;
        case "new_task_assigned":
          return userPrefs.newTaskAssigned;
        case "daily_digest":
          return userPrefs.dailyDigest;
        default:
          return true;
      }
    });

    if (filteredUserIds.length === 0) {
      return success({
        message: "No users to notify (all filtered by preferences)",
        sent: 0,
        failed: 0,
      });
    }

    // Get subscriptions for filtered users
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: inArray(pushSubscriptions.userId, filteredUserIds),
    });

    if (subscriptions.length === 0) {
      return success({
        message: "No push subscriptions found for target users",
        sent: 0,
        failed: 0,
      });
    }

    // Create notification payload
    const payload = createNotificationPayload(type as NotificationType, data);

    // Send notifications to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub) =>
        sendPushToSubscription(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload,
        ),
      ),
    );

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return success({
      message: `Notifications sent: ${sent}, failed: ${failed}`,
      sent,
      failed,
      details: results,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/notifications/send/check-due - Check for tasks due soon and send notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hoursAhead = parseInt(searchParams.get("hours") || "24", 10);

    const now = new Date();
    const futureDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    // Find tasks due within the specified time window
    const dueTasks = await db.query.tasks.findMany({
      where: and(
        gte(tasks.dueDate, now),
        lt(tasks.dueDate, futureDate),
        eq(tasks.status, "pending"),
      ),
      with: {
        assignee: true,
      },
    });

    const notifications = [];

    for (const task of dueTasks) {
      if (task.assignedTo && task.assignee) {
        const hoursRemaining = Math.ceil(
          (new Date(task.dueDate!).getTime() - now.getTime()) /
            (1000 * 60 * 60),
        );

        notifications.push({
          userId: task.assignedTo,
          type: "task_due_soon",
          data: {
            taskId: task.id,
            taskTitle: task.title,
            hoursRemaining,
          },
        });
      }
    }

    // Find overdue tasks
    const overdueTasks = await db.query.tasks.findMany({
      where: and(lt(tasks.dueDate, now), eq(tasks.status, "pending")),
      with: {
        assignee: true,
      },
    });

    for (const task of overdueTasks) {
      if (task.assignedTo && task.assignee) {
        notifications.push({
          userId: task.assignedTo,
          type: "task_overdue",
          data: {
            taskId: task.id,
            taskTitle: task.title,
          },
        });
      }
    }

    return success({
      message: `Found ${notifications.length} notifications to send`,
      dueTasks: dueTasks.length,
      overdueTasks: overdueTasks.length,
      notifications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
