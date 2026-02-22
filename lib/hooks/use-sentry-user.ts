"use client";

/**
 * Hook to sync authenticated user with Sentry
 *
 * This hook should be called in client components that have access to the user.
 * It safely updates Sentry user context without causing SSR issues.
 */

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { setSentryUserFromClient } from "@/components/sentry-user-provider";

export function useSentryUser(): void {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (user) {
      setSentryUserFromClient({
        id: user.id,
        email: user.email || undefined,
        username: user.name || undefined,
      });
    } else {
      setSentryUserFromClient(null);
    }
  }, [user]);
}
