export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { text, link, active, startDate, endDate } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });
    const ann = await prisma.announcement.create({
      data: {
        text,
        link: link || null,
        active: active ?? true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(ann, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
