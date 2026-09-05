import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const schoolId = url.searchParams.get('schoolId');
  const status = url.searchParams.get('status') || 'approved';
  const where: any = { status };
  if (schoolId) where.schoolId = schoolId;
  const ebooks = await prisma.eBook.findMany({
    where,
    include: { school: { select: { name: true, slug: true, initials: true } }, user: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ ebooks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, author, description, filePath, isPublicFile, schoolId } = body;
  if (!title || !schoolId) {
    return NextResponse.json({ error: 'Title and school are required' }, { status: 400 });
  }
  const ebook = await prisma.eBook.create({
    data: {
      title,
      author: author || null,
      description: description || null,
      filePath: filePath || null,
      isPublicFile: isPublicFile ?? true,
      schoolId,
      userId: session.user.id,
      status: 'pending',
    },
  });
  return NextResponse.json(ebook, { status: 201 });
}
