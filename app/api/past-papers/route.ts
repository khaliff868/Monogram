import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyAdmins } from '@/lib/notify-admins';
import { isStaff } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const subject = url.searchParams.get('subject');
  const examType = url.searchParams.get('examType');
  const year = url.searchParams.get('year');
  const status = url.searchParams.get('status') || 'approved';

  const where: any = { status };
  if (subject) where.subject = subject;
  if (examType) where.examType = examType;
  if (year) where.year = parseInt(year);

  const papers = await prisma.pastPaper.findMany({
    where,
    include: { user: { select: { id: true, username: true } } },
    orderBy: [{ year: 'desc' }, { subject: 'asc' }],
  });

  return NextResponse.json({ papers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isStaff(user.role)) return NextResponse.json({ error: 'Only admins and moderators can add past papers' }, { status: 403 });

  const body = await req.json();
  const { subject, examType, year, paperNum, filePath, isPublicFile } = body;

  if (!subject || !examType || !year) {
    return NextResponse.json({ error: 'Subject, exam type, and year are required' }, { status: 400 });
  }

  const paper = await prisma.pastPaper.create({
    data: {
      subject,
      examType,
      year: parseInt(year),
      paperNum: paperNum || null,
      filePath: filePath || null,
      isPublicFile: isPublicFile ?? true,
      userId: session.user.id,
      status: 'pending',
    },
  });

  await notifyAdmins({
    type: 'new_past_paper',
    title: 'New past paper pending approval',
    message: `${subject} (${examType}, ${year}) submitted to the shared library`,
    link: '/admin/past-papers',
  });

  return NextResponse.json(paper, { status: 201 });
}
