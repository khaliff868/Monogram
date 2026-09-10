import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isStaff } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const oldPaper = await prisma.pastPaper.findUnique({ where: { id }, include: { school: { select: { name: true, slug: true } } } });
  const paper = await prisma.pastPaper.update({ where: { id }, data: body });

  if (body.status && oldPaper && oldPaper.userId && body.status !== oldPaper.status) {
    const isApproved = body.status === 'approved';
    await prisma.notification.create({
      data: {
        userId: oldPaper.userId,
        type: isApproved ? 'listing_approved' : 'listing_rejected',
        title: isApproved ? 'Past Paper Approved!' : 'Past Paper Not Approved',
        message: isApproved
          ? `Your past paper (${oldPaper.subject} ${oldPaper.examType} ${oldPaper.year}) for ${oldPaper.school?.name} has been approved.`
          : `Your past paper (${oldPaper.subject} ${oldPaper.examType} ${oldPaper.year}) for ${oldPaper.school?.name} was not approved.`,
        link: isApproved ? `/schools/${oldPaper.school?.slug}` : undefined,
      },
    }).catch(() => {});
  }

  return NextResponse.json(paper);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.pastPaper.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
