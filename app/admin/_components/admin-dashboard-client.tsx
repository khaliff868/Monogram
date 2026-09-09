'use client';

import { AdminSidebar } from './admin-sidebar';
import { Navbar } from '@/components/navbar';
import { FadeIn } from '@/components/ui/animate';
import { GraduationCap, Users, Activity, Megaphone, BookOpen, FileText, ImageIcon, Flag } from 'lucide-react';

interface Stats {
  totalSchools: number;
  totalMembers: number;
  activeMembers: number;
  totalListings: number;
  pendingListings: number;
  pastPapers: number;
  activeAds: number;
  pendingReports: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: color + '15', color }}>{icon}</div>
      </div>
      <p className="text-2xl font-display font-bold" style={{ color: '#663f30' }}>{value}</p>
    </div>
  );
}

export function AdminDashboardClient({ stats }: { stats: Stats }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Admin Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Schools" value={stats?.totalSchools ?? 0} icon={<GraduationCap className="w-4 h-4" />} color="#663f30" />
                <StatCard label="Total Members" value={stats?.totalMembers ?? 0} icon={<Users className="w-4 h-4" />} color="#FFA800" />
                <StatCard label="Active Members" value={stats?.activeMembers ?? 0} icon={<Activity className="w-4 h-4" />} color="#22c55e" />
                <StatCard label="Active Ads" value={stats?.activeAds ?? 0} icon={<ImageIcon className="w-4 h-4" />} color="#ef4444" />
                <StatCard label="Total Listings" value={stats?.totalListings ?? 0} icon={<BookOpen className="w-4 h-4" />} color="#3b82f6" />
                <StatCard label="Pending Listings" value={stats?.pendingListings ?? 0} icon={<Megaphone className="w-4 h-4" />} color="#f59e0b" />
                <StatCard label="Past Papers" value={stats?.pastPapers ?? 0} icon={<FileText className="w-4 h-4" />} color="#8b5cf6" />
                <StatCard label="Pending Reports" value={stats?.pendingReports ?? 0} icon={<Flag className="w-4 h-4" />} color="#dc2626" />
              </div>
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
