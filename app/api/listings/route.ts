import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyAdmins } from '@/lib/notify-admins';

export const dynamic = 'force-dynamic';

// GET listings (public, filtered by school/category/status)
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const schoolId = url.searchParams.get('schoolId');
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status') || 'approved';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;

  const where: any = { status };
  if (schoolId) where.schoolId = schoolId;
  if (category) where.category = category;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { school: { select: { name: true, slug: true, initials: true } }, user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ listings, total, pages: Math.ceil(total / limit) });
}

// POST create listing (auth required)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, category, condition, price, photos, contactPhone, contactEmail, contactWhatsApp, schoolId, examType } = body;

  if (!title || !category || !schoolId) {
    return NextResponse.json({ error: 'Title, category, and school are required' }, { status: 400 });
  }

  const existingCount = await prisma.listing.count({
    where: { userId: session.user.id, status: { not: 'rejected' } },
  });
  if (existingCount >= 5) {
    return NextResponse.json({ error: 'You can have a maximum of 5 listings at a time' }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description: description || null,
      category,
      condition: condition || null,
      price: price ? parseFloat(price) : null,
      photos: photos || [],
      contactPhone: contactPhone || null,
      contactEmail: contactEmail || null,
      contactWhatsApp: contactWhatsApp || null,
      examType: examType || 'CSEC',
      schoolId,
      userId: session.user.id,
      status: 'pending',
    },
  });
  await notifyAdmins({
    type: 'new_listing',
    title: 'New listing pending approval',
    message: `"${title}" submitted in ${category}`,
    link: '/admin/listings',
  });


  return NextResponse.json(listing, { status: 201 });
}
