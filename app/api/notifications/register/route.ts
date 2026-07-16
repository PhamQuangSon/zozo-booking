import { NextResponse } from 'next/server';
import { auth } from '@/config/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { token, device } = await req.json();
    if (!token) {
      return new NextResponse('Token required', { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { token },
      update: { userId: session.user.id, device },
      create: {
        token,
        userId: session.user.id,
        device
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push registration error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
