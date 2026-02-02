"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
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

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    taskReminders: true,
    urgentAlerts: true,
    dailyDigest: false,
    newTaskAssigned: true,
    taskOverdue: true,
    reminderHoursBefore: 24,
  });

  // Check browser support and load preferences on mount
  useEffect(() => {
    async function initialize() {
      setIsSupported(isPushNotificationSupported());
      setPermission(getNotificationPermission());

      if (isPushNotificationSupported()) {
        const subscribed = await isSubscribedToPush();
        setIsSubscribed(subscribed);
      }

      // Load preferences from server
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

    initialize();
  }, [userId]);

  // Handle enabling/disabling push notifications
  const handleTogglePush = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isSubscribed) {
        await unsubscribeFromPushNotifications(userId);
        setIsSubscribed(false);
        setPreferences((prev) => ({ ...prev, enabled: false }));
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive push notifications.",
        });
      } else {
        const subscription = await subscribeToPushNotifications(userId);
        if (subscription) {
          setIsSubscribed(true);
          setPermission("granted");
          setPreferences((prev) => ({ ...prev, enabled: true }));
          toast({
            title: "Notifications Enabled",
            description:
              "You will now receive push notifications for important updates.",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please allow notifications in your browser settings.",
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
      toast({
        title: "Error",
        description:
          "Failed to update notification settings. Please try again.",
        variant: "error",
      });
    }

    setIsSaving(false);
  };

  // Save preferences to server
  const savePreferences = async (
    newPreferences: Partial<NotificationPreferences>,
  ) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...updatedPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications about your farm
          activities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Support Status */}
        {!isSupported && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Browser Not Supported</span>
            </div>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Push notifications are not supported in this browser. Please use a
              modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        )}

        {/* Push Notifications Toggle */}
        {isSupported && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <Label htmlFor="push-toggle" className="font-medium">
                  Push Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? "You are receiving push notifications"
                  : permission === "denied"
                    ? "Notifications are blocked. Please update your browser settings."
                    : "Enable to receive instant notifications"}
              </p>
            </div>
            <Button
              variant={isSubscribed ? "outline" : "default"}
              onClick={handleTogglePush}
              disabled={isSaving || permission === "denied"}
            >
              {isSaving ? "..." : isSubscribed ? "Disable" : "Enable"}
            </Button>
          </div>
        )}

        {/* Notification Type Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>

          {/* Task Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before tasks are due
                </p>
              </div>
            </div>
            <Switch
              id="task-reminders"
              checked={preferences.taskReminders}
              onCheckedChange={(checked) =>
                savePreferences({ taskReminders: checked })
              }
              disabled={!preferences.enabled}
            />
          </div>

          {/* Reminder Timing */}
          {preferences.taskReminders && (
            <div className="ml-8 flex items-center gap-3">
              <Label
                htmlFor="reminder-hours"
                className="text-sm text-muted-foreground"
              >
                Remind me
              </Label>
              <Select
                value={preferences.reminderHoursBefore.toString()}
                onValueChange={(value) =>
                  savePreferences({ reminderHoursBefore: parseInt(value, 10) })
                }
                disabled={!preferences.enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">2 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                before due date
              </span>
            </div>
          )}

          {/* Task Overdue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <Label htmlFor="task-overdue">Overdue Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when tasks become overdue
                </p>
              </div>
            </div>
            <Switch
              id="task-overdue"
              checked={preferences.taskOverdue}
              onCheckedChange={(checked) =>
                savePreferences({ taskOverdue: checked })
              }
              disabled={!preferences.enabled}
            />
          </div>

          {/* Urgent Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <Label htmlFor="urgent-alerts">Urgent Task Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Immediate notifications for urgent tasks
                </p>
              </div>
            </div>
            <Switch
              id="urgent-alerts"
              checked={preferences.urgentAlerts}
              onCheckedChange={(checked) =>
                savePreferences({ urgentAlerts: checked })
              }
              disabled={!preferences.enabled}
            />
          </div>

          {/* New Task Assigned */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="new-task">New Task Assigned</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a task is assigned to you
                </p>
              </div>
            </div>
            <Switch
              id="new-task"
              checked={preferences.newTaskAssigned}
              onCheckedChange={(checked) =>
                savePreferences({ newTaskAssigned: checked })
              }
              disabled={!preferences.enabled}
            />
          </div>

          {/* Daily Digest */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-500" />
              <div>
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of your tasks
                </p>
              </div>
            </div>
            <Switch
              id="daily-digest"
              checked={preferences.dailyDigest}
              onCheckedChange={(checked) =>
                savePreferences({ dailyDigest: checked })
              }
              disabled={!preferences.enabled}
            />
          </div>
        </div>

        {/* Test Notification Button */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch("/api/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId,
                      type: "new_task_assigned",
                      data: {
                        taskId: "test",
                        taskTitle: "Test Notification",
                      },
                    }),
                  });

                  if (response.ok) {
                    toast({
                      title: "Test Sent",
                      description: "Check your notifications!",
                    });
                  } else {
                    throw new Error("Failed to send test notification");
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to send test notification.",
                    variant: "error",
                  });
                }
              }}
            >
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
