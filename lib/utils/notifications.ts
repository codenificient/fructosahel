/**
 * Push Notification Utility for FructoSahel
 * Phase 10.8 - Web Push API implementation
 */

// Types for push notification payloads
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Notification types for task-related events
export type NotificationType =
  | "task_due_soon"
  | "task_overdue"
  | "urgent_task_assigned"
  | "new_task_assigned"
  | "daily_digest";

// Check if the browser supports push notifications
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Get the current notification permission status
export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!isPushNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission;
}

// Request notification permission from the user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Register the service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported");
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    throw error;
  }
}

// Convert a base64 string to a Uint8Array (for VAPID key)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(
  userId: string,
): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported");
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  try {
    const registration = await registerServiceWorker();

    // Get the VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("VAPID public key not configured");
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    // Send subscription to our server
    await saveSubscriptionToServer(userId, subscription);

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    throw error;
  }
}

// Save the subscription to the server
async function saveSubscriptionToServer(
  userId: string,
  subscription: PushSubscription,
): Promise<void> {
  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      subscription: subscription.toJSON(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save subscription");
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(
  userId: string,
): Promise<void> {
  if (!isPushNotificationSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Remove subscription from server
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          endpoint: subscription.endpoint,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    throw error;
  }
}

// Get current push subscription
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error("Failed to get current subscription:", error);
    return null;
  }
}

// Check if user is subscribed to push notifications
export async function isSubscribedToPush(): Promise<boolean> {
  const subscription = await getCurrentSubscription();
  return subscription !== null;
}

// Create notification payload for different event types
export function createNotificationPayload(
  type: NotificationType,
  data: Record<string, unknown>,
): NotificationPayload {
  const basePayload: Partial<NotificationPayload> = {
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    requireInteraction: false,
  };

  switch (type) {
    case "task_due_soon":
      return {
        ...basePayload,
        title: "Task Due Soon",
        body: `"${data.taskTitle}" is due in ${data.hoursRemaining} hours`,
        tag: `task-due-${data.taskId}`,
        data: { type, taskId: data.taskId, url: `/dashboard/tasks` },
        actions: [
          { action: "view", title: "View Task" },
          { action: "dismiss", title: "Dismiss" },
        ],
      } as NotificationPayload;

    case "task_overdue":
      return {
        ...basePayload,
        title: "Task Overdue",
        body: `"${data.taskTitle}" is now overdue!`,
        tag: `task-overdue-${data.taskId}`,
        requireInteraction: true,
        data: { type, taskId: data.taskId, url: `/dashboard/tasks` },
        actions: [
          { action: "view", title: "View Task" },
          { action: "complete", title: "Mark Complete" },
        ],
      } as NotificationPayload;

    case "urgent_task_assigned":
      return {
        ...basePayload,
        title: "Urgent Task Assigned",
        body: `You have been assigned an urgent task: "${data.taskTitle}"`,
        tag: `task-urgent-${data.taskId}`,
        requireInteraction: true,
        data: { type, taskId: data.taskId, url: `/dashboard/tasks` },
        actions: [
          { action: "view", title: "View Task" },
          { action: "acknowledge", title: "Acknowledge" },
        ],
      } as NotificationPayload;

    case "new_task_assigned":
      return {
        ...basePayload,
        title: "New Task Assigned",
        body: `You have been assigned a new task: "${data.taskTitle}"`,
        tag: `task-new-${data.taskId}`,
        data: { type, taskId: data.taskId, url: `/dashboard/tasks` },
        actions: [{ action: "view", title: "View Task" }],
      } as NotificationPayload;

    case "daily_digest":
      return {
        ...basePayload,
        title: "Daily Task Summary",
        body: `You have ${data.taskCount} tasks due today`,
        tag: "daily-digest",
        data: { type, url: `/dashboard/tasks` },
        actions: [{ action: "view", title: "View Tasks" }],
      } as NotificationPayload;

    default:
      return {
        ...basePayload,
        title: "FructoSahel",
        body: "You have a new notification",
        data: { type },
      } as NotificationPayload;
  }
}

// Show a local notification (for testing or when service worker is not available)
export function showLocalNotification(payload: NotificationPayload): void {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction,
    });
  }
}
