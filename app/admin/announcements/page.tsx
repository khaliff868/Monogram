import { prisma } from '@/lib/prisma';
import { AdminAnnouncementsClient } from './_components/admin-announcements-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Announcements | MONOGRAM Admin' };

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return <AdminAnnouncementsClient announcements={JSON.parse(JSON.stringify(announcements))} />;
}
