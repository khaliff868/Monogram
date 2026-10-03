import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getBlockState } from '@/lib/blocks';

export const dynamic = 'force-dynamic';

// GET messages for a conversation (and mark incoming ones read)
export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { conversationId } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    include: {
      participant1: { select: { id: true, username: true } },
      participant2: { select: { id: true, username: true } },
      listing: { select: { id: true, title: true, photos: true, category: true, price: true } },
    },
  });
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, read: false },
    data: { read: true, readAt: new Date() },
  });

  const otherId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
  const blockState = await getBlockState(userId, otherId);

  return NextResponse.json({ conversation, messages, blockState });
}

// POST - Send a message in an existing conversation
export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { conversationId } = await params;

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) return NextResponse.json({ error: 'Message content is required' }, { status: 400 });

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ participant1Id: userId }, { participant2Id: userId }] },
  });
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  const otherParticipantId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
  const blockState = await getBlockState(userId, otherParticipantId);
  if (blockState.blockedByMe || blockState.blockedByThem) {
    return NextResponse.json({ error: 'You cannot message this user' }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, content: content.trim() },
    include: { sender: { select: { id: true, username: true } } },
  });

  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  const recipientId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
  const sender = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `${sender?.username ?? 'Someone'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      link: `/dashboard/messages/${conversationId}`,
    },
  });

  return NextResponse.json(message);
}
