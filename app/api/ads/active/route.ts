import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const ads = await prisma.advertisement.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const withUrls = await Promise.all(
    ads.map(async (ad) => {
      let imageUrl: string | null = null;
      if (ad.bannerImagePath) {
        imageUrl = ad.bannerImagePath.startsWith('http')
          ? ad.bannerImagePath
          : await getFileUrl(ad.bannerImagePath, 'image/*', ad.isPublicImage).catch(() => null);
      }
      return {
        id: ad.id,
        advertiserName: ad.advertiserName,
        imageUrl,
        destinationUrl: ad.destinationUrl,
      };
    })
  );

  return NextResponse.json({ ads: withUrls.filter(a => a.imageUrl) });
}
