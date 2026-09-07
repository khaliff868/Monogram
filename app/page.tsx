import { prisma } from '@/lib/prisma';
import { HomeClient } from './_components/home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [schools, schoolCount, memberCount] = await Promise.all([
    prisma.school.findMany({
      where: { visible: true },
      orderBy: { name: 'asc' },
      take: 24,
      select: { id: true, slug: true, name: true, location: true, type: true, gender: true, initials: true, verified: true },
    }),
    prisma.school.count({ where: { visible: true } }),
    prisma.user.count(),
  ]);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://monogram.tt';
  return <HomeClient schools={schools} schoolCount={schoolCount} memberCount={memberCount} siteUrl={siteUrl} />;
}
