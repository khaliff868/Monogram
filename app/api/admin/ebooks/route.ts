import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status');
  const where: any = {};
  if (status) where.status = status;

  const ebooks = await prisma.eBook.findMany({
    where,
    include: {
      school: { select: { name: true, slug: true } },
      user: { select: { username: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(ebooks);
}
