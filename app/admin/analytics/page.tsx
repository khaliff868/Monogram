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
    supplierTotal,
    supplierVerified,
    supplierPending,
    allSuppliers,
  ] = await Promise.all([
    prisma.advertisement.findMany({
      select: { id: true, advertiserName: true, impressions: true, clicks: true, active: true },
      orderBy: { impressions: 'desc' },
    }),
    prisma.schoolPageView.count(),
    prisma.schoolPageView.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.schoolPageView.groupBy({ by: ['schoolId'], _count: { schoolId: true }, orderBy: { _count: { schoolId: 'desc' } }, take: 10 }),
    prisma.favoriteSchool.groupBy({ by: ['schoolId'], _count: { schoolId: true }, orderBy: { _count: { schoolId: 'desc' } }, take: 10 }),
    prisma.pastPaper.findMany({ where: { status: 'approved' }, select: { id: true, subject: true, examType: true, year: true, downloads: true, school: { select: { name: true } } }, orderBy: { downloads: 'desc' }, take: 10 }),
    prisma.pastPaper.aggregate({ _sum: { downloads: true } }),
    prisma.supplier.count(),
    prisma.supplier.count({ where: { verified: true } }),
    prisma.supplier.count({ where: { status: 'pending' } }),
    prisma.supplier.findMany({ where: { status: 'approved' }, select: { categories: true } }),
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

  // Supplier category breakdown
  const catCounts: Record<string, number> = {};
  for (const s of allSuppliers) {
    for (const c of s.categories) catCounts[c] = (catCounts[c] || 0) + 1;
  }
  const supplierCategories = Object.entries(catCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);

  return (
    <AdminAnalyticsClient
      data={{
        ads,
        totalViews,
        views30d,
        topViewed,
        topFavorited,
        topPapers: topPapers.map((p) => ({ id: p.id, label: `${p.subject} — ${p.examType} ${p.year}`, school: p.school.name, downloads: p.downloads })),
        totalDownloads: totalDownloads._sum.downloads || 0,
        supplierTotal,
        supplierVerified,
        supplierPending,
        supplierCategories,
      }}
    />
  );
}
