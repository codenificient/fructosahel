"use client";

import { authClient } from "@/lib/auth/client";
import { useSentryUser } from "@/lib/hooks";
import { NotificationPrompt } from "./notification-prompt";

export default function NotificationPromptWithUser() {
  const { data: session } = authClient.useSession();

  // Sync user with Sentry when in dashboard
  useSentryUser();

  // Use a demo user ID if not authenticated
  const userId = session?.user?.id || "demo-user-id";

  return <NotificationPrompt userId={userId} />;
}
