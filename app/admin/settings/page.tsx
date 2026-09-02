import { prisma } from '@/lib/prisma';
import { AdminSettingsClient } from './_components/admin-settings-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Site Settings | MONOGRAM Admin' };

export default async function AdminSettingsPage() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: 'default' } });
  }
  return <AdminSettingsClient settings={JSON.parse(JSON.stringify(settings))} />;
}
