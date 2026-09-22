"use client";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushNotificationManager() {
  usePushNotifications();
  return null;
}

// Re-export the hook so callers can trigger permission from a button
export { usePushNotifications };
