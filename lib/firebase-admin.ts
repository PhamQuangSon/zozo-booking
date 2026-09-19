import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import prisma from './prisma';

let messaging: Messaging | null = null;

export function getAdminMessaging(): Messaging | null {
  if (messaging) return messaging;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin credentials missing. Push notifications are disabled.');
    return null;
  }

  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      return null;
    }
  }

  try {
    messaging = getMessaging();
    return messaging;
  } catch (error) {
    console.error('Failed to initialize messaging', error);
    return null;
  }
}

export async function sendNotificationToRole(role: any, title: string, body: string, data?: any) {
  const adminMessaging = getAdminMessaging();
  if (!adminMessaging) return;

  try {
    const users = await prisma.user.findMany({
      where: { role },
      include: { pushSubscriptions: true } as any
    });

    const tokens = users.flatMap(u => (u as any).pushSubscriptions.map((sub: any) => sub.token));
    if (tokens.length === 0) return;

    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending notification to role:', error);
  }
}

export async function sendNotificationToUser(userId: string, title: string, body: string, data?: any) {
  const adminMessaging = getAdminMessaging();
  if (!adminMessaging) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true } as any
    });
    
    if (!user || !(user as any).pushSubscriptions?.length) return;

    const tokens = (user as any).pushSubscriptions.map((sub: any) => sub.token);
    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
}
