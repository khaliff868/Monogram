import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SettingsClient } from './_components/settings-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings | MONOGRAM' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return <SettingsClient />;
}
