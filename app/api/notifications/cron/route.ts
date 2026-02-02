import { NextRequest } from "next/server";
import { handleApiError, success } from "@/lib/api/errors";
import {
  checkAndSendDueReminders,
  checkAndSendOverdueNotifications,
  sendDailyDigests,
} from "@/lib/services/notification-service";

// Secret key to protect the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET;

// Verify cron authorization
function verifyCronAuth(request: NextRequest): boolean {
  // Allow in development without secret
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Check for authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  // Check for Vercel cron header
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron === "true") {
    return true;
  }

  return false;
}

/**
 * POST /api/notifications/cron
 * Endpoint for scheduled notification jobs
 *
 * Query params:
 * - job: "due-reminders" | "overdue" | "daily-digest" | "all"
 *
 * Example cron setup (Vercel):
 * - Due reminders: every hour - "0 * * * *"
 * - Overdue: every 4 hours - "0 0,4,8,12,16,20 * * *"
 * - Daily digest: 8 AM daily - "0 8 * * *"
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(request.url);
    const job = searchParams.get("job") || "all";

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      job,
    };

    switch (job) {
      case "due-reminders": {
        const dueResults = await checkAndSendDueReminders();
        results.dueReminders = dueResults;
        break;
      }

      case "overdue": {
        const overdueResults = await checkAndSendOverdueNotifications();
        results.overdue = overdueResults;
        break;
      }

      case "daily-digest": {
        const digestResults = await sendDailyDigests();
        results.dailyDigest = digestResults;
        break;
      }

      case "all": {
        const [dueResults, overdueResults, digestResults] = await Promise.all([
          checkAndSendDueReminders(),
          checkAndSendOverdueNotifications(),
          sendDailyDigests(),
        ]);

        results.dueReminders = dueResults;
        results.overdue = overdueResults;
        results.dailyDigest = digestResults;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown job: ${job}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    return success(results);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET endpoint for health checks
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return success({
    status: "healthy",
    timestamp: new Date().toISOString(),
    availableJobs: ["due-reminders", "overdue", "daily-digest", "all"],
  });
}
