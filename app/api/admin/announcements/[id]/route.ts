export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    if (body.text !== undefined) data.text = body.text;
    if (body.link !== undefined) data.link = body.link || null;
    if (body.active !== undefined) data.active = body.active;
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    const ann = await prisma.announcement.update({ where: { id }, data });
    return NextResponse.json(ann);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
