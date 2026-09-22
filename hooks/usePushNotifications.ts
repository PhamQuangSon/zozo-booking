"use client";
import { useEffect, useRef, useState } from "react";
import { requestNotificationPermission, setupMessageListener } from "@/lib/firebase";
import { toast } from "sonner";

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "denied") return;
    if (Notification.permission === "granted" && token) return;

    const t = await requestNotificationPermission();
    if (!t) return;

    setToken(t);

    try {
      await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t, device: "web" }),
      });
    } catch (e) {
      console.error("Failed to register push token:", e);
    }

    const unsub = await setupMessageListener((payload) => {
      if (payload.notification) {
        toast(payload.notification.title, {
          description: payload.notification.body,
        });
      }
    });
    if (unsub) unsubscribeRef.current = unsub;
  };

  useEffect(() => {
    // Only auto-init if user already granted permission in a previous visit
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      requestPermission();
    }
    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  return { token, requestPermission };
}
