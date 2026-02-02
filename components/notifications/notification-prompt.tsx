"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
} from "@/lib/utils/notifications";

interface NotificationPromptProps {
  userId: string;
}

const PROMPT_DISMISSED_KEY = "fructosahel_notification_prompt_dismissed";
const PROMPT_DELAY_MS = 3000; // Show prompt after 3 seconds

export function NotificationPrompt({ userId }: NotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const shouldShowPrompt = () => {
      // Don't show if not supported
      if (!isPushNotificationSupported()) {
        return false;
      }

      // Don't show if already granted or denied
      const permission = getNotificationPermission();
      if (permission !== "default") {
        return false;
      }

      // Don't show if user has dismissed before
      const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const daysSinceDismissed =
          (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          return false;
        }
      }

      return true;
    };

    // Delay showing the prompt
    const timer = setTimeout(() => {
      if (shouldShowPrompt()) {
        setIsVisible(true);
      }
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      const subscription = await subscribeToPushNotifications(userId);
      if (subscription) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Enable notifications to get alerts about urgent tasks, due dates,
              and important farm updates.
            </p>

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleEnable} disabled={isLoading}>
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
