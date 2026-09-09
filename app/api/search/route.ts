import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ schools: [], listings: [], pastPapers: [] });
  }

  const contains = { startsWith: q, mode: 'insensitive' as const };

  try {
    const [schools, listings, pastPapers] = await Promise.all([
      prisma.school.findMany({
        where: {
          visible: true,
          name: contains,
        },
        select: { id: true, name: true, slug: true, location: true, region: true, type: true, gender: true, initials: true, verified: true },
        take: 20,
      }),
      prisma.listing.findMany({
        where: {
          status: 'approved',
          title: contains,
        },
        select: { id: true, title: true, category: true, price: true, school: { select: { name: true, slug: true } } },
        take: 20,
      }),
      prisma.pastPaper.findMany({
        where: {
          status: 'approved',
          subject: contains,
        },
        select: { id: true, subject: true, examType: true, year: true, paperNum: true, school: { select: { name: true, slug: true } } },
        take: 20,
      }),
    ]);

    return NextResponse.json({ schools, listings, pastPapers });
  } catch (e) {
    console.error('Search error:', e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
