import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePreferences } from '@/lib/user-preferences';
import { auth } from '@/auth';
import { isBlockedEitherWay } from '@/lib/blocks';

export const dynamic = 'force-dynamic';

// GET all conversations for the current user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      participant1: { select: { id: true, username: true } },
      participant2: { select: { id: true, username: true } },
      listing: { select: { id: true, title: true, photos: true, category: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: { conversationId: conv.id, senderId: { not: userId }, read: false },
      });
      return { ...conv, unreadCount };
    })
  );

  return NextResponse.json(conversationsWithUnread);
}

// POST - Start a new conversation (or get existing one) and optionally send an initial message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const { recipientId, listingId, initialMessage } = body;

  if (!recipientId) return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
  if (recipientId === userId) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

  if (await isBlockedEitherWay(userId, recipientId)) {
    return NextResponse.json({ error: 'You cannot message this user' }, { status: 403 });
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: userId, participant2Id: recipientId, listingId: listingId || null },
        { participant1Id: recipientId, participant2Id: userId, listingId: listingId || null },
      ],
    },
  });

  if (!conversation) {
    const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { preferences: true } });
    if (recipient && normalizePreferences(recipient.preferences).allowMessages === false) {
      return NextResponse.json({ error: 'This user is not accepting new messages' }, { status: 403 });
    }
    conversation = await prisma.conversation.create({
      data: { participant1Id: userId, participant2Id: recipientId, listingId: listingId || null },
    });
  }

  if (initialMessage) {
    await prisma.message.create({
      data: { conversationId: conversation.id, senderId: userId, content: initialMessage },
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    const sender = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        message: `${sender?.username ?? 'Someone'}: ${initialMessage.substring(0, 50)}${initialMessage.length > 50 ? '...' : ''}`,
        link: `/dashboard/messages/${conversation.id}`,
      },
    });
  }

  return NextResponse.json(conversation);
}

// DELETE - Remove a conversation and all its messages
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const conversationId = req.nextUrl.searchParams.get('conversationId');
  if (!conversationId) return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ participant1Id: userId }, { participant2Id: userId }] },
  });
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  await prisma.message.deleteMany({ where: { conversationId } });
  await prisma.conversation.delete({ where: { id: conversationId } });

  return NextResponse.json({ success: true });
}
