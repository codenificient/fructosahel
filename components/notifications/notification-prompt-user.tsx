"use client";

import { useUser } from "@stackframe/stack";
import { useSentryUser } from "@/lib/hooks";
import { NotificationPrompt } from "./notification-prompt";

export default function NotificationPromptWithUser() {
  const user = useUser();

  // Sync user with Sentry when in dashboard
  useSentryUser();

  // Use a demo user ID if not authenticated
  const userId = user?.id || "demo-user-id";

  return <NotificationPrompt userId={userId} />;
}
