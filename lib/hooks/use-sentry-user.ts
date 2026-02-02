"use client";

/**
 * Hook to sync authenticated user with Sentry
 *
 * This hook should be called in client components that have access to the user.
 * It safely updates Sentry user context without causing SSR issues.
 */

import { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { setSentryUserFromClient } from "@/components/sentry-user-provider";

export function useSentryUser(): void {
  const user = useUser();

  useEffect(() => {
    if (user) {
      setSentryUserFromClient({
        id: user.id,
        email: user.primaryEmail || undefined,
        username: user.displayName || undefined,
      });
    } else {
      setSentryUserFromClient(null);
    }
  }, [user]);
}
