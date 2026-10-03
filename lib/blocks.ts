import { prisma } from '@/lib/prisma';

// Returns which direction (if any) a block exists between two users.
export async function getBlockState(userId: string, otherId: string) {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherId },
        { blockerId: otherId, blockedId: userId },
      ],
    },
    select: { blockerId: true },
  });
  return {
    blockedByMe: blocks.some(b => b.blockerId === userId),
    blockedByThem: blocks.some(b => b.blockerId === otherId),
  };
}

export async function isBlockedEitherWay(userId: string, otherId: string) {
  const s = await getBlockState(userId, otherId);
  return s.blockedByMe || s.blockedByThem;
}
