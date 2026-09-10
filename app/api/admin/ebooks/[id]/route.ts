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

  const oldEbook = await prisma.eBook.findUnique({ where: { id }, include: { school: { select: { name: true, slug: true } } } });
  const ebook = await prisma.eBook.update({ where: { id }, data: body });

  if (body.status && oldEbook && oldEbook.userId && body.status !== oldEbook.status) {
    const isApproved = body.status === 'approved';
    await prisma.notification.create({
      data: {
        userId: oldEbook.userId,
        type: isApproved ? 'listing_approved' : 'listing_rejected',
        title: isApproved ? 'E-Book Approved!' : 'E-Book Not Approved',
        message: isApproved
          ? `Your e-book "${oldEbook.title}" for ${oldEbook.school?.name} has been approved.`
          : `Your e-book "${oldEbook.title}" for ${oldEbook.school?.name} was not approved.`,
        link: isApproved ? `/schools/${oldEbook.school?.slug}` : undefined,
      },
    }).catch(() => {});
  }

  return NextResponse.json(ebook);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.eBook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
