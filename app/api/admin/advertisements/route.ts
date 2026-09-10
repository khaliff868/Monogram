export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { advertiserName, bannerImagePath, destinationUrl, active, showOnAll, startDate, endDate, schoolIds } = await req.json();
    if (!advertiserName) return NextResponse.json({ error: 'Advertiser name required' }, { status: 400 });
    const ad = await prisma.advertisement.create({
      data: {
        advertiserName,
        bannerImagePath: bannerImagePath || null,
        destinationUrl: destinationUrl || null,
        active: active ?? true,
        showOnAll: showOnAll ?? true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        adSchools: schoolIds?.length ? { create: schoolIds.map((schoolId: string) => ({ schoolId })) } : undefined,
      },
    });
    return NextResponse.json(ad, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
