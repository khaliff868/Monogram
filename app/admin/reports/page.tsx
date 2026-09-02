import { prisma } from '@/lib/prisma';
import { AdminReportsClient } from './_components/admin-reports-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reports | Admin | MONOGRAM' };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { username: true, email: true } },
    },
  });

  return <AdminReportsClient reports={JSON.parse(JSON.stringify(reports))} />;
}
