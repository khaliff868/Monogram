import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
