import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: 'insensitive' },
      id: { not: session.user.id },
      suspended: false,
    },
    select: { id: true, username: true },
    take: 8,
  });

  return NextResponse.json({ users });
}
