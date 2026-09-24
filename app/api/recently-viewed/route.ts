export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { normalizePreferences } from '@/lib/user-preferences';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false });
  const user = session.user as any;
  try {
    const { schoolId } = await req.json();
    if (!schoolId) return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
    const me = await prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } });
    if (!normalizePreferences(me?.preferences).saveRecentlyViewed) return NextResponse.json({ success: true, skipped: true });
    await prisma.recentlyViewed.upsert({
      where: { userId_schoolId: { userId: user.id, schoolId } },
      create: { userId: user.id, schoolId },
      update: { viewedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
