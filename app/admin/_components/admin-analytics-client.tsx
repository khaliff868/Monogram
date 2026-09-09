'use client';

import { AdminSidebar } from './admin-sidebar';
import { Navbar } from '@/components/navbar';
import { FadeIn } from '@/components/ui/animate';
import { Eye, Heart, Download, MousePointerClick, TrendingUp } from 'lucide-react';

interface AdRow { id: string; advertiserName: string; impressions: number; clicks: number; active: boolean; }
interface RankRow { name: string; slug: string; count: number; }
interface PaperRow { id: string; label: string; school: string; downloads: number; }

interface Data {
  ads: AdRow[];
  totalViews: number;
  views30d: number;
  topViewed: RankRow[];
  topFavorited: RankRow[];
  topPapers: PaperRow[];
  totalDownloads: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
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

function RankList({ title, icon, rows, unit }: { title: string; icon: React.ReactNode; rows: RankRow[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="bg-card rounded-xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
      <h3 className="flex items-center gap-2 font-display font-semibold text-[#663f30] mb-4">{icon} {title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-foreground truncate mr-2">{i + 1}. {r.name}</span>
                <span className="text-muted-foreground shrink-0">{r.count} {unit}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, backgroundColor: '#FFA800' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminAnalyticsClient({ data }: { data: Data }) {
  const totalImpressions = data.ads.reduce((a, b) => a + b.impressions, 0);
  const totalClicks = data.ads.reduce((a, b) => a + b.clicks, 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Analytics</h1>

              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total School Views" value={data.totalViews.toLocaleString('en-US')} icon={<Eye className="w-4 h-4" />} color="#663f30" />
                <StatCard label="Views (30 days)" value={data.views30d.toLocaleString('en-US')} icon={<TrendingUp className="w-4 h-4" />} color="#22c55e" />
                <StatCard label="Ad Impressions" value={totalImpressions.toLocaleString('en-US')} icon={<Eye className="w-4 h-4" />} color="#3b82f6" />
                <StatCard label="Paper Downloads" value={data.totalDownloads.toLocaleString('en-US')} icon={<Download className="w-4 h-4" />} color="#8b5cf6" />
              </div>

              {/* Advertising analytics */}
              <h2 className="font-display text-lg font-semibold text-[#663f30] mb-3">Advertising Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <StatCard label="Total Impressions" value={totalImpressions.toLocaleString('en-US')} icon={<Eye className="w-4 h-4" />} color="#663f30" />
                <StatCard label="Total Clicks" value={totalClicks.toLocaleString('en-US')} icon={<MousePointerClick className="w-4 h-4" />} color="#FFA800" />
                <StatCard label="Overall CTR" value={`${overallCtr}%`} icon={<TrendingUp className="w-4 h-4" />} color="#22c55e" />
              </div>
              <div className="bg-card rounded-xl overflow-hidden mb-8" style={{ boxShadow: 'var(--shadow-md)' }}>
                {data.ads.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-5">No advertisements yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Advertiser</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Impressions</th>
                          <th className="px-4 py-3 font-medium text-right">Clicks</th>
                          <th className="px-4 py-3 font-medium text-right">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.ads.map((ad) => {
                          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={ad.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3 font-medium text-[#663f30]">{ad.advertiserName}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ad.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{ad.active ? 'Active' : 'Inactive'}</span>
                              </td>
                              <td className="px-4 py-3 text-right">{ad.impressions.toLocaleString('en-US')}</td>
                              <td className="px-4 py-3 text-right">{ad.clicks.toLocaleString('en-US')}</td>
                              <td className="px-4 py-3 text-right font-medium">{ctr}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* School statistics */}
              <h2 className="font-display text-lg font-semibold text-[#663f30] mb-3">School Statistics</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <RankList title="Most Viewed Schools" icon={<Eye className="w-4 h-4 text-[#FFA800]" />} rows={data.topViewed} unit="views" />
                <RankList title="Most Favorited Schools" icon={<Heart className="w-4 h-4 text-[#FFA800]" />} rows={data.topFavorited} unit="favorites" />
              </div>

              {/* Top papers */}
              <h2 className="font-display text-lg font-semibold text-[#663f30] mb-3">Most Downloaded Past Papers</h2>
              <div className="bg-card rounded-xl overflow-hidden mb-8" style={{ boxShadow: 'var(--shadow-md)' }}>
                {data.topPapers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-5">No past papers yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Paper</th>
                          <th className="px-4 py-3 font-medium">School</th>
                          <th className="px-4 py-3 font-medium text-right">Downloads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topPapers.map((p) => (
                          <tr key={p.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-medium text-[#663f30]">{p.label}</td>
                            <td className="px-4 py-3 text-muted-foreground">{p.school}</td>
                            <td className="px-4 py-3 text-right">{p.downloads.toLocaleString('en-US')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
