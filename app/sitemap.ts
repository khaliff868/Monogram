import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrl();
  const staticPages = ['', '/schools', '/about', '/search', '/login', '/signup'];

  let schoolEntries: MetadataRoute.Sitemap = [];
  try {
    const schools = await prisma.school.findMany({
      where: { visible: true },
      select: { slug: true, updatedAt: true },
    });
    schoolEntries = schools.map((s) => ({
      url: `${baseUrl}/schools/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    schoolEntries = [];
  }

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.6,
  }));

  return [...staticEntries, ...schoolEntries];
}
