import { prisma } from '@/lib/prisma';
import { HomeClient } from './_components/home-client';
import { getFileUrl } from '@/lib/s3';
import type { HomeAd } from './_components/home-ad-banner';

export const dynamic = 'force-dynamic';

async function getActiveAd(): Promise<HomeAd | null> {
  const now = new Date();
  const ad = await prisma.advertisement.findFirst({
    where: {
      active: true,
      showOnAll: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
      bannerImagePath: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, advertiserName: true, bannerImagePath: true, isPublicImage: true, destinationUrl: true },
  });
  if (!ad || !ad.bannerImagePath) return null;

  let imageUrl: string | null = null;
  if (/^https?:\/\//i.test(ad.bannerImagePath)) {
    imageUrl = ad.bannerImagePath;
  } else {
    try {
      imageUrl = await getFileUrl(ad.bannerImagePath, 'image/jpeg', ad.isPublicImage);
    } catch {
      imageUrl = null;
    }
  }

  return {
    id: ad.id,
    advertiserName: ad.advertiserName,
    imageUrl,
    destinationUrl: ad.destinationUrl,
  };
}

export default async function HomePage() {
  const [schools, schoolCount, memberCount, ad] = await Promise.all([
    prisma.school.findMany({
      where: { visible: true },
      orderBy: { name: 'asc' },
      take: 12,
      select: { id: true, slug: true, name: true, location: true, type: true, gender: true, initials: true, verified: true },
    }),
    prisma.school.count({ where: { visible: true } }),
    prisma.user.count(),
    getActiveAd(),
  ]);

  const siteUrl = process.env.NEXTAUTH_URL || 'https://monogram.tt';

  return <HomeClient schools={schools} schoolCount={schoolCount} memberCount={memberCount} ad={ad} siteUrl={siteUrl} />;
}
