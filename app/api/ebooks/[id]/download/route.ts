import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ebook = await prisma.eBook.findUnique({ where: { id, status: 'approved' } });
  if (!ebook || !ebook.filePath) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.eBook.update({ where: { id }, data: { downloads: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ url: ebook.filePath });
}
