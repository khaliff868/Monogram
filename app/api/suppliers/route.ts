import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const schoolId = url.searchParams.get('schoolId');
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status') || 'approved';

  const where: any = { status };
  if (category) where.categories = { has: category };

  if (schoolId) {
    const suppliers = await prisma.supplier.findMany({
      where: {
        ...where,
        supplierSchools: { some: { schoolId } },
      },
      include: {
        supplierSchools: { include: { school: { select: { name: true, slug: true } } } },
        user: { select: { username: true } },
      },
      orderBy: [{ verified: 'desc' }, { businessName: 'asc' }],
    });
    return NextResponse.json({ suppliers });
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      supplierSchools: { include: { school: { select: { name: true, slug: true } } } },
      user: { select: { username: true } },
    },
    orderBy: [{ verified: 'desc' }, { businessName: 'asc' }],
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { businessName, description, categories, location, phone, email, whatsApp, website, schoolIds } = body;

  if (!businessName || !categories?.length) {
    return NextResponse.json({ error: 'Business name and at least one category are required' }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: {
      businessName,
      description: description || null,
      categories,
      location: location || null,
      phone: phone || null,
      email: email || null,
      whatsApp: whatsApp || null,
      website: website || null,
      userId: session.user.id,
      status: 'pending',
      supplierSchools: schoolIds?.length
        ? { create: schoolIds.map((sid: string) => ({ schoolId: sid })) }
        : undefined,
    },
  });

  return NextResponse.json(supplier, { status: 201 });
}
