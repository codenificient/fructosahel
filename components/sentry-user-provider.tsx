"use client";

/**
 * Sentry User Provider
 *
 * This component syncs the authenticated user context from Stack Auth to Sentry.
 * It should be placed inside the StackProvider in the layout.
 *
 * Note: This component doesn't use useUser directly to avoid SSR issues.
 * User context is set via the useSentryUser hook in pages that need it.
 */

import { useEffect, useState } from "react";
import { setUserContext, addBreadcrumb } from "@/lib/utils/error-tracking";

interface SentryUserProviderProps {
  children: React.ReactNode;
}

// Context to allow child components to set user
interface UserInfo {
  id: string;
  email?: string;
  username?: string;
  [key: string]: string | undefined;
}

// Global setter for user context (called from pages/components that have user)
let globalUserSetter: ((user: UserInfo | null) => void) | null = null;

export function setSentryUserFromClient(user: UserInfo | null): void {
  if (globalUserSetter) {
    globalUserSetter(user);
  } else if (user) {
    // Direct set if provider not mounted yet
    setUserContext(user);
  }
}

export function SentryUserProvider({ children }: SentryUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Register the global setter
    globalUserSetter = (user) => {
      setCurrentUser(user);
    };

    return () => {
      globalUserSetter = null;
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Set user context in Sentry
      setUserContext({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.username,
      });

      // Add breadcrumb for user identification
      addBreadcrumb("User identified", {
        category: "auth",
        level: "info",
        data: {
          userId: currentUser.id,
          hasEmail: !!currentUser.email,
        },
      });
    } else {
      // Clear user context when logged out
      setUserContext(null);
    }
  }, [currentUser]);

  return <>{children}</>;
}
