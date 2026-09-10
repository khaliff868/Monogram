import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyAdmins } from '@/lib/notify-admins';
import { isStaff } from '@/lib/roles';

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
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isStaff(user.role)) return NextResponse.json({ error: 'Only admins and moderators can add e-books' }, { status: 403 });
  const body = await req.json();
  const { title, author, description, filePath, isPublicFile, schoolId, examType } = body;
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
      examType: examType || 'CSEC',
      schoolId,
      userId: session.user.id,
      status: 'pending',
    },
    include: { school: { select: { name: true } } },
  });

  await notifyAdmins({
    type: 'new_ebook',
    title: 'New e-book pending approval',
    message: `"${title}" submitted for ${ebook.school.name}`,
    link: '/admin/ebooks',
  });

  return NextResponse.json(ebook, { status: 201 });
}
