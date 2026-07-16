import * as admin from 'firebase-admin';
import prisma from './prisma';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const messaging = admin.messaging();

export async function sendNotificationToRole(role: any, title: string, body: string, data?: any) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      include: { pushSubscriptions: true }
    });

    const tokens = users.flatMap(u => u.pushSubscriptions.map(sub => sub.token));
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
      include: { pushSubscriptions: true }
    });
    
    if (!user || user.pushSubscriptions.length === 0) return;

    const tokens = user.pushSubscriptions.map(sub => sub.token);
    await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
}
