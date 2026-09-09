export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.location !== undefined) data.location = body.location;
    if (body.region !== undefined) data.region = body.region;
    if (body.type !== undefined) data.type = body.type;
    if (body.level !== undefined) data.level = body.level;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.website !== undefined) data.website = body.website || null;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.established !== undefined) data.established = body.established;
    if (body.initials !== undefined) data.initials = body.initials || null;
    if (body.visible !== undefined) data.visible = body.visible;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.monogramUrl !== undefined) data.monogramUrl = body.monogramUrl;

    const school = await prisma.school.update({ where: { id }, data });
    return NextResponse.json(school);
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.school.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
