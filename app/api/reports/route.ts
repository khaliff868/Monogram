import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, targetId, targetName, reason, details } = body;

  if (!type || !targetId || !reason) {
    return NextResponse.json({ error: 'Type, target ID, and reason are required' }, { status: 400 });
  }

  // Check for duplicate reports
  const existing = await prisma.report.findFirst({
    where: { type, targetId, userId: session.user.id, status: 'pending' },
  });
  if (existing) {
    return NextResponse.json({ error: 'You have already reported this item' }, { status: 409 });
  }

  const report = await prisma.report.create({
    data: {
      type,
      targetId,
      targetName: targetName || null,
      reason,
      details: details || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
