import { prisma } from '@/lib/prisma';
import { AdminDashboardClient } from './_components/admin-dashboard-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Dashboard | MONOGRAM' };

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalSchools, totalMembers, activeMembers, activeAds, totalListings, pendingListings, pastPapers, pendingReports] = await Promise.all([
    prisma.school.count(),
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.advertisement.count({ where: { active: true } }),
    prisma.listing.count({ where: { status: 'approved' } }),
    prisma.listing.count({ where: { status: 'pending' } }),
    prisma.pastPaper.count({ where: { status: 'approved' } }),
    prisma.report.count({ where: { status: 'pending' } }),
  ]);

  return (
    <AdminDashboardClient
      stats={{
        totalSchools,
        totalMembers,
        activeMembers,
        totalListings,
        pendingListings,
        pastPapers,
        activeAds,
        pendingReports,
      }}
    />
  );
}
