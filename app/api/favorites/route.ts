export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  try {
    const { schoolId } = await req.json();
    if (!schoolId) return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    await prisma.favoriteSchool.upsert({
      where: { userId_schoolId: { userId: user.id, schoolId } },
      create: { userId: user.id, schoolId },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  try {
    const { schoolId } = await req.json();
    if (!schoolId) return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    await prisma.favoriteSchool.deleteMany({ where: { userId: user.id, schoolId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
