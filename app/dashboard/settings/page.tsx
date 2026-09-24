import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from './_components/settings-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings | MONOGRAM' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user as any;
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    select: { username: true, email: true },
  });

  return <SettingsClient user={dbUser} />;
}
