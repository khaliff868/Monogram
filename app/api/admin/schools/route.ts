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
    const body = await req.json();
    const { name, slug, location, region, type, gender, description, website, phone, email, established, initials, level } = body;
    if (!name || !location || !region) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.school.findUnique({ where: { slug: finalSlug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    const school = await prisma.school.create({
      data: { name, slug: finalSlug, location, region, type: type ?? 'Government', gender: gender ?? 'Co-ed', level: level ?? 'Secondary', description: description || null, website: website || null, phone: phone || null, email: email || null, established: established ?? null, initials: initials || name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 4) },
    });
    return NextResponse.json(school, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
