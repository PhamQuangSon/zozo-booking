import { initializeApp, getApps } from "firebase/app";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const initMessaging = async () => {
  try {
    if (typeof window !== 'undefined') {
      const { isSupported, getMessaging } = await import('firebase/messaging');
      const supported = await isSupported();
      if (!supported) return null;
      return getMessaging(app);
    }
  } catch (err) {
    console.error(err);
  }
  return null;
};

export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await initMessaging();
      if (!messaging) return null;
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
};

export const setupMessageListener = async (callback: (payload: any) => void) => {
  const messaging = await initMessaging();
  if (!messaging) return null;
  const { onMessage } = await import('firebase/messaging');
  return onMessage(messaging, callback);
};
