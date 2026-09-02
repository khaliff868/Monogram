import { prisma } from '@/lib/prisma';
import { AdminUsersClient } from './_components/admin-users-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Users | MONOGRAM Admin' };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, username: true, role: true, suspended: true, createdAt: true, lastLoginAt: true },
  });
  return <AdminUsersClient users={JSON.parse(JSON.stringify(users))} />;
}
