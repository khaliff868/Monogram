export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...body },
      update: body,
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
