"use client";
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationManager() {
  usePushNotifications();
  return null; // This is a headless component that just manages notifications
}
