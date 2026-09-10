export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    if (body.advertiserName !== undefined) data.advertiserName = body.advertiserName;
    if (body.bannerImagePath !== undefined) data.bannerImagePath = body.bannerImagePath || null;
    if (body.destinationUrl !== undefined) data.destinationUrl = body.destinationUrl || null;
    if (body.active !== undefined) data.active = body.active;
    if (body.showOnAll !== undefined) data.showOnAll = body.showOnAll;
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    const ad = await prisma.advertisement.update({ where: { id }, data });

    if (body.schoolIds !== undefined) {
      await prisma.adSchool.deleteMany({ where: { advertisementId: id } });
      if (body.schoolIds?.length) {
        await prisma.adSchool.createMany({ data: body.schoolIds.map((schoolId: string) => ({ advertisementId: id, schoolId })) });
      }
    }
    return NextResponse.json(ad);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.advertisement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
