"use client";

import { useUser } from "@stackframe/stack";
import { useSentryUser } from "@/lib/hooks";

export default function UserInfo() {
  const user = useUser();

  // Sync user with Sentry
  useSentryUser();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <p className="text-muted-foreground">
            {user?.displayName || "Demo User"}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <p className="text-muted-foreground">
            {user?.primaryEmail || "demo@fructosahel.com"}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Profile editing coming soon. Contact support to update your information.
      </p>
    </div>
  );
}
