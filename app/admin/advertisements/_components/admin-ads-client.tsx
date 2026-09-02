'use client';

import { useState } from 'react';
import { AdminSidebar } from '../../_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/ui/animate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Ad {
  id: string;
  advertiserName: string;
  bannerImagePath: string | null;
  destinationUrl: string | null;
  active: boolean;
  showOnAll: boolean;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string | null;
  adSchools: { school: { id: string; name: string } }[];
}

interface SchoolOption {
  id: string;
  name: string;
}

export function AdminAdsClient({ ads, schools }: { ads: Ad[]; schools: SchoolOption[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    advertiserName: '', destinationUrl: '', active: true, showOnAll: true,
    startDate: '', endDate: '', schoolIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.advertiserName) { toast.error('Advertiser name required'); return; }
    setSaving(true);
    try {
      let bannerImagePath = form.bannerImagePath ?? null;

      // Upload banner if selected
      if (bannerFile) {
        const presignRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: bannerFile.name, contentType: bannerFile.type, isPublic: true }),
        });
        if (presignRes.ok) {
          const { uploadUrl, cloud_storage_path } = await presignRes.json();
          await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': bannerFile.type }, body: bannerFile });
          bannerImagePath = cloud_storage_path;
        }
      }

      const body = { ...form, bannerImagePath };
      const url = editing ? `/api/admin/advertisements/${editing}` : '/api/admin/advertisements';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created');
        setShowForm(false);
        setEditing(null);
        setBannerFile(null);
        router.refresh();
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    const res = await fetch(`/api/admin/advertisements/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); router.refresh(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/advertisements/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
    router.refresh();
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
                <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: '#663f30' }}>Advertisements</h1>
                <Button size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white" onClick={() => { setEditing(null); setForm({ advertiserName: '', destinationUrl: '', active: true, showOnAll: true, startDate: '', endDate: '', schoolIds: [] }); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Ad
                </Button>
              </div>

              <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                <Table>
                  <TableHeader><TableRow><TableHead>Advertiser</TableHead><TableHead className="hidden md:table-cell">Status</TableHead><TableHead className="hidden md:table-cell">Stats</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(ads ?? []).map((ad: Ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="text-sm font-medium">{ad.advertiserName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {ad.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          <BarChart3 className="w-3 h-3 inline mr-1" />{ad.impressions ?? 0} views · {ad.clicks ?? 0} clicks
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => toggleActive(ad.id, ad.active)}>
                              {ad.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => {
                              setEditing(ad.id);
                              setForm({
                                advertiserName: ad.advertiserName,
                                destinationUrl: ad.destinationUrl ?? '',
                                bannerImagePath: ad.bannerImagePath,
                                active: ad.active,
                                showOnAll: ad.showOnAll,
                                startDate: ad.startDate?.split?.('T')?.[0] ?? '',
                                endDate: ad.endDate?.split?.('T')?.[0] ?? '',
                                schoolIds: (ad.adSchools ?? []).map((as: any) => as?.school?.id).filter(Boolean),
                              });
                              setShowForm(true);
                            }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(ad.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Advertisement</DialogTitle></DialogHeader>
                  <form onSubmit={handleSave} className="space-y-3">
                    <div><Label className="text-xs">Advertiser Name *</Label><Input value={form?.advertiserName ?? ''} onChange={e => setForm({ ...(form ?? {}), advertiserName: e.target.value })} className="mt-1" /></div>
                    <div><Label className="text-xs">Banner Image</Label><Input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] ?? null)} className="mt-1" /></div>
                    <div><Label className="text-xs">Destination URL</Label><Input value={form?.destinationUrl ?? ''} onChange={e => setForm({ ...(form ?? {}), destinationUrl: e.target.value })} className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Start Date</Label><Input type="date" value={form?.startDate ?? ''} onChange={e => setForm({ ...(form ?? {}), startDate: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-xs">End Date</Label><Input type="date" value={form?.endDate ?? ''} onChange={e => setForm({ ...(form ?? {}), endDate: e.target.value })} className="mt-1" /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={form?.showOnAll ?? true} onChange={e => setForm({ ...(form ?? {}), showOnAll: e.target.checked })} />
                      <span className="text-xs">Show on all schools</span>
                    </div>
                    {!form?.showOnAll && (
                      <div>
                        <Label className="text-xs">Select Schools</Label>
                        <div className="mt-1 max-h-32 overflow-y-auto border border-border rounded-md p-2 space-y-1">
                          {(schools ?? []).map((s: SchoolOption) => (
                            <label key={s.id} className="flex items-center gap-2 text-xs">
                              <input type="checkbox" checked={(form?.schoolIds ?? []).includes(s.id)} onChange={e => {
                                const ids = form?.schoolIds ?? [];
                                setForm({ ...(form ?? {}), schoolIds: e.target.checked ? [...ids, s.id] : ids.filter((id: string) => id !== s.id) });
                              }} />
                              {s.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button type="submit" loading={saving} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">Save</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
