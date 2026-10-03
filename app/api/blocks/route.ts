import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET - users the current user has blocked
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    include: { blocked: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(blocks);
}

// POST - block a user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  if (blockedId === userId) return NextResponse.json({ error: 'You cannot block yourself' }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: userId, blockedId } },
    update: {},
    create: { blockerId: userId, blockedId },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE - unblock a user (?userId=...)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blockedId = req.nextUrl.searchParams.get('userId');
  if (!blockedId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  await prisma.block.deleteMany({ where: { blockerId: session.user.id, blockedId } });
  return NextResponse.json({ success: true });
}
