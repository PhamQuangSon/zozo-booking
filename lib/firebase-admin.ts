import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import prisma from './prisma';

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const messaging = getMessaging();

export async function sendNotificationToRole(role: any, title: string, body: string, data?: any) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      include: { pushSubscriptions: true } as any
    });

    const tokens = users.flatMap(u => (u as any).pushSubscriptions.map((sub: any) => sub.token));
    if (tokens.length === 0) return;

    await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending notification to role:', error);
  }
}

export async function sendNotificationToUser(userId: string, title: string, body: string, data?: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true } as any
    });
    
    if (!user || !(user as any).pushSubscriptions?.length) return;

    const tokens = (user as any).pushSubscriptions.map((sub: any) => sub.token);
    await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
}
