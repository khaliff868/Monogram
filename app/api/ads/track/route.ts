export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { adId, type } = await req.json();
    if (!adId || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    if (type === 'impression') {
      await prisma.advertisement.update({ where: { id: adId }, data: { impressions: { increment: 1 } } });
    } else if (type === 'click') {
      await prisma.advertisement.update({ where: { id: adId }, data: { clicks: { increment: 1 } } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
