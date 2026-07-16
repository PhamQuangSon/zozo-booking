"use client";
import { useState, useEffect } from 'react';
import { requestNotificationPermission, setupMessageListener } from '@/lib/firebase';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const t = await requestNotificationPermission();
      if (t) {
        setToken(t);
        try {
          await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: t, device: 'web' })
          });
        } catch(e) { console.error(e); }
      }
    }
    init();

    let unsubscribe: any = null;
    setupMessageListener((payload) => {
      console.log('Push received:', payload);
      if (payload.notification) {
        toast(payload.notification.title, {
          description: payload.notification.body,
        });
      }
    }).then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { token };
}
