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
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SafeDate } from '@/components/safe-format';

interface Announcement {
  id: string;
  text: string;
  link: string | null;
  active: boolean;
  startDate: string;
  endDate: string | null;
}

export function AdminAnnouncementsClient({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ text: '', link: '', active: true, startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.text) { toast.error('Text is required'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/announcements/${editing}` : '/api/admin/announcements';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created');
        setShowForm(false);
        setEditing(null);
        setForm({ text: '', link: '', active: true, startDate: '', endDate: '' });
        router.refresh();
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); router.refresh(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/announcements/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
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
                <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: '#663f30' }}>Announcements</h1>
                <Button size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white" onClick={() => { setEditing(null); setForm({ text: '', link: '', active: true, startDate: '', endDate: '' }); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                <Table>
                  <TableHeader><TableRow><TableHead>Text</TableHead><TableHead className="hidden md:table-cell">Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(announcements ?? []).map((a: Announcement) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm max-w-[200px] truncate">{a.text}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${a.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {a.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => toggleActive(a.id, a.active)}>
                              {a.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(a.id); setForm({ text: a.text, link: a.link ?? '', active: a.active, startDate: a.startDate?.split?.('T')?.[0] ?? '', endDate: a.endDate?.split?.('T')?.[0] ?? '' }); setShowForm(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Announcement</DialogTitle></DialogHeader>
                  <form onSubmit={handleSave} className="space-y-3">
                    <div><Label className="text-xs">Text *</Label><Input value={form?.text ?? ''} onChange={e => setForm({ ...(form ?? {}), text: e.target.value })} className="mt-1" /></div>
                    <div><Label className="text-xs">Link (optional)</Label><Input value={form?.link ?? ''} onChange={e => setForm({ ...(form ?? {}), link: e.target.value })} className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Start Date</Label><Input type="date" value={form?.startDate ?? ''} onChange={e => setForm({ ...(form ?? {}), startDate: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-xs">End Date</Label><Input type="date" value={form?.endDate ?? ''} onChange={e => setForm({ ...(form ?? {}), endDate: e.target.value })} className="mt-1" /></div>
                    </div>
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
