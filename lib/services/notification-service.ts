/**
 * Notification Service
 * Server-side service for triggering push notifications
 */

import webpush from "web-push";
import { eq, and, lt, gte, inArray } from "drizzle-orm";
import {
  db,
  pushSubscriptions,
  notificationPreferences,
  tasks,
} from "@/lib/db";
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

interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  data: Record<string, unknown>;
}

interface SendBulkNotificationOptions {
  userIds: string[];
  type: NotificationType;
  data: Record<string, unknown>;
}

/**
 * Send a push notification to a specific user
 */
export async function sendNotification({
  userId,
  type,
  data,
}: SendNotificationOptions): Promise<{ success: boolean; error?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "VAPID keys not configured" };
  }

  // Check user preferences
  const userPrefs = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, userId),
  });

  // Check if notification type is enabled
  if (userPrefs) {
    if (!userPrefs.enabled) {
      return { success: false, error: "Notifications disabled by user" };
    }

    switch (type) {
      case "task_due_soon":
        if (!userPrefs.taskReminders)
          return { success: false, error: "Task reminders disabled" };
        break;
      case "task_overdue":
        if (!userPrefs.taskOverdue)
          return { success: false, error: "Overdue alerts disabled" };
        break;
      case "urgent_task_assigned":
        if (!userPrefs.urgentAlerts)
          return { success: false, error: "Urgent alerts disabled" };
        break;
      case "new_task_assigned":
        if (!userPrefs.newTaskAssigned)
          return { success: false, error: "New task alerts disabled" };
        break;
      case "daily_digest":
        if (!userPrefs.dailyDigest)
          return { success: false, error: "Daily digest disabled" };
        break;
    }
  }

  // Get user's push subscriptions
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });

  if (subscriptions.length === 0) {
    return { success: false, error: "No push subscriptions found" };
  }

  // Create notification payload
  const payload = createNotificationPayload(type, data);

  // Send to all user's subscriptions
  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload),
          {
            TTL: 60 * 60,
            urgency: type === "urgent_task_assigned" ? "high" : "normal",
          },
        );
        return { success: true };
      } catch (error: unknown) {
        // Clean up invalid subscriptions
        if (error instanceof webpush.WebPushError && error.statusCode === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, sub.endpoint));
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  const successCount = results.filter((r) => r.success).length;
  return {
    success: successCount > 0,
    error:
      successCount === 0 ? "Failed to send to all subscriptions" : undefined,
  };
}

/**
 * Send notifications to multiple users
 */
export async function sendBulkNotification({
  userIds,
  type,
  data,
}: SendBulkNotificationOptions): Promise<{
  sent: number;
  failed: number;
  details: Array<{ userId: string; success: boolean; error?: string }>;
}> {
  const results = await Promise.all(
    userIds.map(async (userId) => {
      const result = await sendNotification({ userId, type, data });
      return { userId, ...result };
    }),
  );

  return {
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    details: results,
  };
}

/**
 * Notify user when a new task is assigned to them
 */
export async function notifyNewTaskAssigned(
  taskId: string,
  taskTitle: string,
  assignedToUserId: string,
  priority: string,
): Promise<void> {
  const type =
    priority === "urgent" ? "urgent_task_assigned" : "new_task_assigned";

  await sendNotification({
    userId: assignedToUserId,
    type,
    data: {
      taskId,
      taskTitle,
    },
  });
}

/**
 * Check for tasks due soon and send reminder notifications
 * This should be called by a cron job or scheduled function
 */
export async function checkAndSendDueReminders(): Promise<{
  checked: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();

  // Get all users with their preferences
  const allPrefs = await db.query.notificationPreferences.findMany({
    where: eq(notificationPreferences.taskReminders, true),
  });

  let checked = 0;
  let sent = 0;
  let failed = 0;

  for (const prefs of allPrefs) {
    const hoursAhead = prefs.reminderHoursBefore;
    const futureDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    // Find tasks due within user's reminder window
    const dueTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.assignedTo, prefs.userId),
        gte(tasks.dueDate, now),
        lt(tasks.dueDate, futureDate),
        eq(tasks.status, "pending"),
      ),
    });

    checked += dueTasks.length;

    for (const task of dueTasks) {
      const hoursRemaining = Math.ceil(
        (new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60),
      );

      const result = await sendNotification({
        userId: prefs.userId,
        type: "task_due_soon",
        data: {
          taskId: task.id,
          taskTitle: task.title,
          hoursRemaining,
        },
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
  }

  return { checked, sent, failed };
}

/**
 * Check for overdue tasks and send notifications
 * This should be called by a cron job or scheduled function
 */
export async function checkAndSendOverdueNotifications(): Promise<{
  checked: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();

  // Find all overdue tasks
  const overdueTasks = await db.query.tasks.findMany({
    where: and(lt(tasks.dueDate, now), eq(tasks.status, "pending")),
  });

  let sent = 0;
  let failed = 0;

  for (const task of overdueTasks) {
    if (task.assignedTo) {
      const result = await sendNotification({
        userId: task.assignedTo,
        type: "task_overdue",
        data: {
          taskId: task.id,
          taskTitle: task.title,
        },
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
  }

  return { checked: overdueTasks.length, sent, failed };
}

/**
 * Send daily digest to all users who have it enabled
 * This should be called by a cron job at a specific time (e.g., 8 AM)
 */
export async function sendDailyDigests(): Promise<{
  sent: number;
  failed: number;
}> {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Get users with daily digest enabled
  const usersWithDigest = await db.query.notificationPreferences.findMany({
    where: eq(notificationPreferences.dailyDigest, true),
  });

  let sent = 0;
  let failed = 0;

  for (const prefs of usersWithDigest) {
    // Count tasks due today for this user
    const todaysTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.assignedTo, prefs.userId),
        gte(tasks.dueDate, now),
        lt(tasks.dueDate, endOfDay),
        eq(tasks.status, "pending"),
      ),
    });

    if (todaysTasks.length > 0) {
      const result = await sendNotification({
        userId: prefs.userId,
        type: "daily_digest",
        data: {
          taskCount: todaysTasks.length,
        },
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
  }

  return { sent, failed };
}
