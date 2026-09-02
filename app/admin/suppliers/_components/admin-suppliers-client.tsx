'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/app/admin/_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { FadeIn } from '@/components/ui/animate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Trash2, Search, Store, User, MapPin, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const categoryLabels: Record<string, string> = {
  BOOKS: 'Books',
  UNIFORMS: 'Uniforms',
  SHOES: 'Shoes',
  SUPPLIES: 'Supplies',
  OTHER: 'Other',
};

export function AdminSuppliersClient() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin/suppliers?status=${filter}` : '/api/admin/suppliers';
      const res = await fetch(url);
      const data = await res.json();
      setSuppliers(data || []);
    } catch { setSuppliers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Supplier ${status}`);
        fetchSuppliers();
      }
    } catch { toast.error('Failed to update'); }
  };

  const toggleVerified = async (id: string, currentlyVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentlyVerified }),
      });
      if (res.ok) {
        toast.success(currentlyVerified ? 'Verification removed' : 'Supplier verified!');
        fetchSuppliers();
      }
    } catch { toast.error('Failed to update'); }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('Delete this supplier permanently?')) return;
    try {
      await fetch(`/api/admin/suppliers/${id}`, { method: 'DELETE' });
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = suppliers.filter(s =>
    s.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Manage Suppliers</h1>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search suppliers..." />
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
                <div className="text-center py-12 text-muted-foreground text-sm">No suppliers found.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(supplier => (
                    <div key={supplier.id} className="bg-card rounded-xl p-4 border border-border hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Store className="w-4 h-4" style={{ color: '#663f30' }} />
                            <h3 className="font-semibold text-sm">{supplier.businessName}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[supplier.status] || ''}`}>{supplier.status}</span>
                            {supplier.verified && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium flex items-center gap-0.5">
                                <BadgeCheck className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                          {supplier.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{supplier.description}</p>}
                          <div className="flex flex-wrap gap-1 mb-1">
                            {supplier.categories?.map((c: string) => (
                              <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA800]/10 font-medium" style={{ color: '#FFA800' }}>
                                {categoryLabels[c] || c}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {supplier.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{supplier.location}</span>}
                            {supplier.user && <span className="flex items-center gap-1"><User className="w-3 h-3" />{supplier.user.username}</span>}
                            {supplier.supplierSchools?.length > 0 && (
                              <span>{supplier.supplierSchools.length} school{supplier.supplierSchools.length > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {supplier.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50" onClick={() => updateStatus(supplier.id, 'approved')}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50" onClick={() => updateStatus(supplier.id, 'rejected')}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {supplier.status === 'approved' && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toggleVerified(supplier.id, supplier.verified)}>
                                <BadgeCheck className="w-3.5 h-3.5 mr-1" /> {supplier.verified ? 'Unverify' : 'Verify'}
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => updateStatus(supplier.id, 'pending')}>
                                Unpublish
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteSupplier(supplier.id)}>
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
