import { prisma } from '@/lib/prisma';
import { AdminAdsClient } from './_components/admin-ads-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Ads | MONOGRAM Admin' };

export default async function AdminAdsPage() {
  const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: 'desc' }, include: { adSchools: { include: { school: { select: { id: true, name: true } } } } } });
  const schools = await prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  return <AdminAdsClient ads={JSON.parse(JSON.stringify(ads))} schools={JSON.parse(JSON.stringify(schools))} />;
}
