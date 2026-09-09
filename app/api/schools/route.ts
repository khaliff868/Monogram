export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';
    const region = url.searchParams.get('region') ?? '';
    const type = url.searchParams.get('type') ?? '';
    const level = url.searchParams.get('level') ?? '';
    const gender = url.searchParams.get('gender') ?? '';
    const sort = url.searchParams.get('sort') ?? 'A-Z';

    const where: any = { visible: true };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (region) where.region = region;
    if (type) where.type = type;
    if (level) where.level = level;
    if (gender) where.gender = gender;

    const schools = await prisma.school.findMany({
      where,
      orderBy: { name: sort === 'Z-A' ? 'desc' : 'asc' },
      select: { id: true, slug: true, name: true, location: true, region: true, type: true, gender: true, initials: true, verified: true, level: true },
    });

    return NextResponse.json(schools);
  } catch (e: any) {
    console.error('Schools API error:', e);
    return NextResponse.json([], { status: 500 });
  }
}
