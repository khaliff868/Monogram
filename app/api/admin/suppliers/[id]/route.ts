import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { schoolIds, ...data } = body;

  const oldSupplier = await prisma.supplier.findUnique({ where: { id } });
  const supplier = await prisma.supplier.update({ where: { id }, data });

  if (schoolIds) {
    await prisma.supplierSchool.deleteMany({ where: { supplierId: id } });
    if (schoolIds.length > 0) {
      await prisma.supplierSchool.createMany({
        data: schoolIds.map((sid: string) => ({ supplierId: id, schoolId: sid })),
      });
    }
  }

  if (data.status && oldSupplier && oldSupplier.userId && data.status !== oldSupplier.status) {
    const isApproved = data.status === 'approved';
    await prisma.notification.create({
      data: {
        userId: oldSupplier.userId,
        type: isApproved ? 'listing_approved' : 'listing_rejected',
        title: isApproved ? 'Supplier Approved!' : 'Supplier Not Approved',
        message: isApproved
          ? `Your supplier "${supplier.businessName}" has been approved and is now visible.`
          : `Your supplier "${supplier.businessName}" was not approved.`,
      },
    }).catch(() => {});
  }

  return NextResponse.json(supplier);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
