import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, pushSubscriptions } from "@/lib/db";
import { handleApiError, success, created } from "@/lib/api/errors";
import { z } from "zod";

// Validation schema for subscription
const subscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

const deleteSchema = z.object({
  userId: z.string().uuid(),
  endpoint: z.string().url(),
});

// POST /api/notifications/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    const { userId, subscription } = validatedData;

    // Check if subscription already exists
    const existingSubscription = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, subscription.endpoint),
    });

    if (existingSubscription) {
      // Update existing subscription
      const [updated] = await db
        .update(pushSubscriptions)
        .set({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
        .returning();

      return success(updated);
    }

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .returning();

    return created(newSubscription);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/notifications/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = deleteSchema.parse(body);

    const { userId, endpoint } = validatedData;

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      );

    return success({ message: "Subscription removed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/notifications/subscribe - Check subscription status
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

    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    });

    return success({
      isSubscribed: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
