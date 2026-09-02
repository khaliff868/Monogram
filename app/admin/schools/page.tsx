import { prisma } from '@/lib/prisma';
import { AdminSchoolsClient } from './_components/admin-schools-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Schools | MONOGRAM Admin' };

export default async function AdminSchoolsPage() {
  const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } });
  return <AdminSchoolsClient schools={JSON.parse(JSON.stringify(schools))} />;
}
