import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = await prisma.pastPaper.findUnique({ where: { id, status: 'approved' } });
  if (!paper || !paper.filePath) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Increment downloads
  await prisma.pastPaper.update({ where: { id }, data: { downloads: { increment: 1 } } }).catch(() => {});

  const url = await getFileUrl(paper.filePath, 'application/pdf', paper.isPublicFile);
  return NextResponse.json({ url });
}
