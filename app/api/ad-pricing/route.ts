import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pricing = await prisma.adPricing.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('Error fetching ad pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, title, price, durationDays, note, sortOrder } = await req.json();

    if (!id || !title || price === undefined || !durationDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pricing = await prisma.adPricing.upsert({
      where: { id },
      update: {
        title,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        note: note || null,
        sortOrder: sortOrder || 0,
      },
      create: {
        id,
        title,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        note: note || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ pricing });
  } catch (error: any) {
    console.error('Error updating ad pricing:', error);
    return NextResponse.json({ error: error.message || 'Failed to update pricing' }, { status: 500 });
  }
}