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

  const oldListing = await prisma.listing.findUnique({ where: { id }, include: { school: { select: { name: true, slug: true } } } });
  const listing = await prisma.listing.update({ where: { id }, data: body });

  // Send notification on status change
  if (body.status && oldListing && body.status !== oldListing.status) {
    const isApproved = body.status === 'approved';
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: isApproved ? 'listing_approved' : 'listing_rejected',
        title: isApproved ? 'Listing Approved!' : 'Listing Not Approved',
        message: isApproved
          ? `Your listing "${listing.title}" for ${oldListing.school?.name} has been approved and is now visible.`
          : `Your listing "${listing.title}" for ${oldListing.school?.name} was not approved.`,
        link: isApproved ? `/schools/${oldListing.school?.slug}` : undefined,
      },
    }).catch(() => {});
  }

  return NextResponse.json(listing);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !isStaff(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
