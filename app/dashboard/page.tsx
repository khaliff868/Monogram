import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardClient } from './_components/dashboard-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard | MONOGRAM' };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user as any;
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    select: { id: true, email: true, username: true, createdAt: true, role: true },
  });

  const favorites = await prisma.favoriteSchool.findMany({
    where: { userId: user?.id },
    include: { school: { select: { id: true, slug: true, name: true, location: true, type: true, gender: true, initials: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const recentlyViewed = await prisma.recentlyViewed.findMany({
    where: { userId: user?.id },
    include: { school: { select: { id: true, slug: true, name: true, location: true, type: true, gender: true, initials: true } } },
    orderBy: { viewedAt: 'desc' },
    take: 10,
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const myListings = await prisma.listing.findMany({
    where: { userId: user?.id },
    include: { school: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <DashboardClient
      user={dbUser ? JSON.parse(JSON.stringify(dbUser)) : null}
      favorites={(favorites ?? []).map((f: any) => f.school)}
      recentlyViewed={(recentlyViewed ?? []).map((r: any) => r.school)}
      notifications={JSON.parse(JSON.stringify(notifications))}
      myListings={JSON.parse(JSON.stringify(myListings))}
    />
  );
}
