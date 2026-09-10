import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { AdminUsersClient } from './_components/admin-users-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Users | MONOGRAM Admin' };

export default async function AdminUsersPage() {
  const session = await auth();
  const viewerRole = (session?.user as any)?.role ?? 'user';
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, username: true, role: true, suspended: true, createdAt: true, lastLoginAt: true },
  });
  return <AdminUsersClient users={JSON.parse(JSON.stringify(users))} viewerRole={viewerRole} />;
}
