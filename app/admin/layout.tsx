import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isStaff } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (!isStaff(user?.role)) redirect('/dashboard');
  return <>{children}</>;
}
