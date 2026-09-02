import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ isFavorited: false });

  const schoolId = req.nextUrl.searchParams.get('schoolId');
  if (!schoolId) return NextResponse.json({ isFavorited: false });

  const fav = await prisma.favoriteSchool.findUnique({
    where: { userId_schoolId: { userId: session.user.id, schoolId } },
  });

  return NextResponse.json({ isFavorited: !!fav });
}
