'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/app/admin/_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { FadeIn } from '@/components/ui/animate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Trash2, Search, BookOpen, GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function AdminEbooksClient() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin/ebooks?status=${filter}` : '/api/admin/ebooks';
      const res = await fetch(url);
      const data = await res.json();
      setEbooks(data || []);
    } catch { setEbooks([]); }
    setLoading(false);
  };

  useEffect(() => { fetchEbooks(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/ebooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`E-book ${status}`);
        fetchEbooks();
      }
    } catch { toast.error('Failed to update'); }
  };

  const deleteEbook = async (id: string) => {
    if (!confirm('Delete this e-book permanently?')) return;
    try {
      await fetch(`/api/admin/ebooks/${id}`, { method: 'DELETE' });
      toast.success('E-book deleted');
      fetchEbooks();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = ebooks.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.author?.toLowerCase().includes(search.toLowerCase()) ||
    e.school?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Manage E-Books</h1>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search e-books..." />
                </div>
                <div className="flex gap-1">
                  {['pending', 'approved', 'rejected', ''].map(s => (
                    <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'}
                      onClick={() => setFilter(s)}
                      className={filter === s ? 'bg-[#663f30] text-white' : ''}
                    >
                      {s || 'All'}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-[#FFA800] border-t-transparent rounded-full animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No e-books found.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(ebook => (
                    <div key={ebook.id} className="bg-card rounded-xl p-4 border border-border hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4" style={{ color: '#FFA800' }} />
                            <h3 className="font-semibold text-sm">{ebook.title}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[ebook.status] || ''}`}>{ebook.status}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">{ebook.examType}</span>
                          </div>
                          {ebook.author && <p className="text-xs text-muted-foreground mb-1">by {ebook.author}</p>}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{ebook.school?.name}</span>
                            {ebook.user && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ebook.user.username}</span>}
                            <span>{ebook.downloads} downloads</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {ebook.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50" onClick={() => updateStatus(ebook.id, 'approved')}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50" onClick={() => updateStatus(ebook.id, 'rejected')}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {ebook.status === 'approved' && (
                            <Button size="sm" variant="outline" className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => updateStatus(ebook.id, 'pending')}>
                              Unpublish
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteEbook(ebook.id)}>
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
