export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  try {
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const body = await req.json();
  const { username, email } = body;

  const data: any = {};
  if (username) data.username = username.trim();
  if (email) data.email = email.trim().toLowerCase();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, username: true, email: true },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const field = e?.meta?.target?.[0] ?? 'field';
      return NextResponse.json({ error: `That ${field} is already taken` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
