export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Download a JSON copy of the signed-in user's data
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const [user, listings, pastPapers, ebooks, favorites, recentlyViewed, notifications, messages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, name: true, phone: true, whatsapp: true, location: true, bio: true, role: true, createdAt: true, lastLoginAt: true, preferences: true },
    }),
    prisma.listing.findMany({ where: { userId } }),
    prisma.pastPaper.findMany({ where: { userId } }),
    prisma.eBook.findMany({ where: { userId } }),
    prisma.favoriteSchool.findMany({ where: { userId }, include: { school: { select: { name: true, slug: true } } } }),
    prisma.recentlyViewed.findMany({ where: { userId }, include: { school: { select: { name: true, slug: true } } } }),
    prisma.notification.findMany({ where: { userId } }),
    prisma.message.findMany({ where: { senderId: userId } }),
  ]);

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), user, listings, pastPapers, ebooks, favorites, recentlyViewed, notifications, messagesSent: messages },
    null,
    2,
  );
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="monogram-data-${user?.username ?? 'user'}.json"`,
    },
  });
}
