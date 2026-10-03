'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/app/admin/_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { FadeIn } from '@/components/ui/animate';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, XCircle, Trash2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SafeDate } from '@/components/safe-format';

interface Report {
  id: string;
  type: string;
  targetId: string;
  targetName: string | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  user: { username: string; email: string };
}

export function AdminReportsClient({ reports: initialReports }: { reports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        toast.success(`Report marked as ${status}`);
      } else toast.error('Failed to update report');
    } catch { toast.error('An error occurred'); }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        toast.success('Report deleted');
      } else toast.error('Failed to delete report');
    } catch { toast.error('An error occurred'); }
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'reviewed') return 'bg-blue-100 text-blue-800';
    if (s === 'resolved') return 'bg-green-100 text-green-800';
    if (s === 'dismissed') return 'bg-gray-100 text-gray-800';
    return 'bg-muted text-muted-foreground';
  };

  const typeLabel = (t: string) => {
    const k = t.toLowerCase();
    if (k === 'school') return 'School';
    if (k === 'listing') return 'Listing';
    if (k === 'supplier') return 'Supplier';
    if (k === 'past_paper') return 'Past paper';
    if (k === 'message') return 'Message';
    if (k === 'user') return 'User';
    return t;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: '#663f30' }}>Reports</h1>
                <div className="flex gap-1">
                  {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map(s => (
                    <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}
                      className={filter === s ? 'bg-[#663f30] text-white' : ''}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Flag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No reports found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(report => (
                    <div key={report.id} className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(report.status)}`}>{report.status}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">{typeLabel(report.type)}</span>
                          </div>
                          <h3 className="font-display font-semibold text-sm" style={{ color: '#663f30' }}>{report.targetName ?? report.targetId}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Reason: {report.reason}</p>
                          {report.details && <p className="text-xs text-muted-foreground mt-0.5">{report.details}</p>}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Reported by {report.user?.username ?? 'Unknown'} on <SafeDate date={report.createdAt} options={{ dateStyle: 'medium' }} />
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {report.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, 'reviewed')} title="Mark as reviewed">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, 'resolved')} title="Resolve" className="text-green-600">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, 'dismissed')} title="Dismiss">
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" onClick={() => deleteReport(report.id)} title="Delete" className="text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
