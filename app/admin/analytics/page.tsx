import { prisma } from '@/lib/prisma';
import { AdminAnalyticsClient } from '../_components/admin-analytics-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics | MONOGRAM Admin' };

export default async function AdminAnalyticsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    ads,
    totalViews,
    views30d,
    viewsBySchool,
    favBySchool,
    topPapers,
    totalDownloads,
  ] = await Promise.all([
    prisma.advertisement.findMany({
      select: { id: true, advertiserName: true, impressions: true, clicks: true, active: true },
      orderBy: { impressions: 'desc' },
    }),
    prisma.schoolPageView.count(),
    prisma.schoolPageView.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.schoolPageView.groupBy({ by: ['schoolId'], _count: { schoolId: true }, orderBy: { _count: { schoolId: 'desc' } }, take: 10 }),
    prisma.favoriteSchool.groupBy({ by: ['schoolId'], _count: { schoolId: true }, orderBy: { _count: { schoolId: 'desc' } }, take: 10 }),
    prisma.pastPaper.findMany({ where: { status: 'approved' }, select: { id: true, subject: true, examType: true, year: true, downloads: true }, orderBy: { downloads: 'desc' }, take: 10 }),
    prisma.pastPaper.aggregate({ _sum: { downloads: true } }),
  ]);

  // Resolve school names for views & favorites
  const schoolIds = Array.from(new Set([...viewsBySchool.map((v) => v.schoolId), ...favBySchool.map((f) => f.schoolId)]));
  const schools = await prisma.school.findMany({ where: { id: { in: schoolIds } }, select: { id: true, name: true, slug: true } });
  const schoolMap = Object.fromEntries(schools.map((s) => [s.id, s]));

  const topViewed = viewsBySchool.map((v) => ({
    name: schoolMap[v.schoolId]?.name || 'Unknown',
    slug: schoolMap[v.schoolId]?.slug || '',
    count: v._count.schoolId,
  }));
  const topFavorited = favBySchool.map((f) => ({
    name: schoolMap[f.schoolId]?.name || 'Unknown',
    slug: schoolMap[f.schoolId]?.slug || '',
    count: f._count.schoolId,
  }));

  return (
    <AdminAnalyticsClient
      data={{
        ads,
        totalViews,
        views30d,
        topViewed,
        topFavorited,
        topPapers: topPapers.map((p) => ({ id: p.id, label: `${p.subject} — ${p.examType} ${p.year}`, downloads: p.downloads })),
        totalDownloads: totalDownloads._sum.downloads || 0,
      }}
    />
  );
}
