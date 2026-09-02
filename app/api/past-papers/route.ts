import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const schoolId = url.searchParams.get('schoolId');
  const subject = url.searchParams.get('subject');
  const examType = url.searchParams.get('examType');
  const year = url.searchParams.get('year');
  const status = url.searchParams.get('status') || 'approved';

  const where: any = { status };
  if (schoolId) where.schoolId = schoolId;
  if (subject) where.subject = subject;
  if (examType) where.examType = examType;
  if (year) where.year = parseInt(year);

  const papers = await prisma.pastPaper.findMany({
    where,
    include: { school: { select: { name: true, slug: true, initials: true } }, user: { select: { username: true } } },
    orderBy: [{ year: 'desc' }, { subject: 'asc' }],
  });

  return NextResponse.json({ papers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { subject, examType, year, paperNum, filePath, isPublicFile, schoolId } = body;

  if (!subject || !examType || !year || !schoolId) {
    return NextResponse.json({ error: 'Subject, exam type, year, and school are required' }, { status: 400 });
  }

  const paper = await prisma.pastPaper.create({
    data: {
      subject,
      examType,
      year: parseInt(year),
      paperNum: paperNum || null,
      filePath: filePath || null,
      isPublicFile: isPublicFile ?? true,
      schoolId,
      userId: session.user.id,
      status: 'pending',
    },
  });

  return NextResponse.json(paper, { status: 201 });
}
