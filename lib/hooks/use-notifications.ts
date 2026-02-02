"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
} from "@/lib/utils/notifications";

interface NotificationPreferences {
  enabled: boolean;
  taskReminders: boolean;
  urgentAlerts: boolean;
  dailyDigest: boolean;
  newTaskAssigned: boolean;
  taskOverdue: boolean;
  reminderHoursBefore: number;
}

interface UseNotificationsOptions {
  userId: string;
}

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  preferences: NotificationPreferences;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  updatePreferences: (
    updates: Partial<NotificationPreferences>,
  ) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  taskReminders: true,
  urgentAlerts: true,
  dailyDigest: false,
  newTaskAssigned: true,
  taskOverdue: true,
  reminderHoursBefore: 24,
};

export function useNotifications({
  userId,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  // Initialize state
  useEffect(() => {
    async function init() {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);
      setPermission(getNotificationPermission());

      if (supported) {
        const subscribed = await isSubscribedToPush();
        setIsSubscribed(subscribed);
      }

      // Load preferences
      try {
        const response = await fetch(
          `/api/notifications/preferences?userId=${userId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.data && !data.data.isDefault) {
            setPreferences({
              enabled: data.data.enabled,
              taskReminders: data.data.taskReminders,
              urgentAlerts: data.data.urgentAlerts,
              dailyDigest: data.data.dailyDigest,
              newTaskAssigned: data.data.newTaskAssigned,
              taskOverdue: data.data.taskOverdue,
              reminderHoursBefore: data.data.reminderHoursBefore,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }

      setIsLoading(false);
    }

    init();
  }, [userId]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const subscription = await subscribeToPushNotifications(userId);
      if (subscription) {
        setIsSubscribed(true);
        setPermission("granted");
        setPreferences((prev) => ({ ...prev, enabled: true }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  }, [isSupported, userId]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<void> => {
    try {
      await unsubscribeFromPushNotifications(userId);
      setIsSubscribed(false);
      setPreferences((prev) => ({ ...prev, enabled: false }));
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      throw error;
    }
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>): Promise<void> => {
      const newPreferences = { ...preferences, ...updates };

      try {
        const response = await fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...newPreferences,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update preferences");
        }

        setPreferences(newPreferences);
      } catch (error) {
        console.error("Failed to update preferences:", error);
        throw error;
      }
    },
    [preferences, userId],
  );

  // Refresh subscription status
  const refreshStatus = useCallback(async (): Promise<void> => {
    if (isSupported) {
      const subscribed = await isSubscribedToPush();
      setIsSubscribed(subscribed);
      setPermission(getNotificationPermission());
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    refreshStatus,
  };
}
