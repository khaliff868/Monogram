export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      select: { id: true, text: true, link: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return NextResponse.json(announcements);
  } catch {
    return NextResponse.json([]);
  }
}
