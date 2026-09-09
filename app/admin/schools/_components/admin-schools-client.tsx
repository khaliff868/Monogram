'use client';

import { useState } from 'react';
import { AdminSidebar } from '../../_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/ui/animate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
  region: string;
  type: string;
  level: string;
  gender: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  established: number | null;
  initials: string | null;
  visible: boolean;
  featured: boolean;
}

const emptySchool = {
  name: '', slug: '', location: '', region: '', type: 'Government', level: 'Secondary', gender: 'Co-ed',
  description: '', website: '', phone: '', email: '', established: '', initials: '',
};

export function AdminSchoolsClient({ schools }: { schools: School[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptySchool);
  const [saving, setSaving] = useState(false);

  const filtered = (schools ?? []).filter((s: School) =>
    s?.name?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '') ??
    s?.location?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '')
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name || !form?.location || !form?.region) { toast.error('Name, location and region are required'); return; }
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const body = { ...form, slug, established: form.established ? parseInt(form.established) : null };
      const url = editing ? `/api/admin/schools/${editing}` : '/api/admin/schools';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? 'School updated' : 'School created');
        setShowForm(false);
        setEditing(null);
        setForm(emptySchool);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data?.error ?? 'Failed to save');
      }
    } catch {
      toast.error('An error occurred');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this school?')) return;
    const res = await fetch(`/api/admin/schools/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('School deleted');
      router.refresh();
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    const res = await fetch(`/api/admin/schools/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !visible }),
    });
    if (res.ok) { router.refresh(); } else { toast.error('Failed to update'); }
  };

  const openEdit = (school: School) => {
    setEditing(school.id);
    setForm({
      name: school.name,
      slug: school.slug,
      location: school.location,
      region: school.region,
      type: school.type,
      level: school.level,
      gender: school.gender,
      description: school.description ?? '',
      website: school.website ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
      established: school.established?.toString() ?? '',
      initials: school.initials ?? '',
    });
    setShowForm(true);
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
                <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: '#663f30' }}>Manage Schools</h1>
                <Button size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white" onClick={() => { setEditing(null); setForm(emptySchool); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add School
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>

              <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden sm:table-cell">Gender</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((school: School) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium text-sm">{school.name}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell">{school.location}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell">{school.type}</TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{school.gender}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon-sm" onClick={() => handleToggleVisibility(school.id, school.visible)} title={school.visible ? 'Hide' : 'Show'}>
                                {school.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(school)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(school.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Add/Edit Dialog */}
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editing ? 'Edit School' : 'Add New School'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSave} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><Label className="text-xs">Name *</Label><Input value={form?.name ?? ''} onChange={e => setForm({ ...(form ?? {}), name: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-xs">Location *</Label><Input value={form?.location ?? ''} onChange={e => setForm({ ...(form ?? {}), location: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-xs">Region *</Label>
                        <select value={form?.region ?? ''} onChange={e => setForm({ ...(form ?? {}), region: e.target.value })} className="mt-1 w-full text-sm px-3 py-2 rounded-md border border-border bg-background">
                          <option value="">Select</option>
                          {['Port of Spain','San Fernando','Arima','Chaguanas','Diego Martin','South Trinidad','Tobago','Central Trinidad','St. Augustine','Princes Town','Siparia','Couva'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div><Label className="text-xs">Type</Label>
                        <select value={form?.type ?? 'Government'} onChange={e => setForm({ ...(form ?? {}), type: e.target.value })} className="mt-1 w-full text-sm px-3 py-2 rounded-md border border-border bg-background">
                          <option value="Government">Government</option><option value="Denominational">Denominational</option><option value="Private">Private</option><option value="Tertiary">Tertiary</option>
                        </select>
                      </div>
                      <div><Label className="text-xs">Level</Label>
                        <select value={form?.level ?? 'Secondary'} onChange={e => setForm({ ...(form ?? {}), level: e.target.value })} className="mt-1 w-full text-sm px-3 py-2 rounded-md border border-border bg-background">
                          <option value="Primary">Primary</option><option value="Secondary">Secondary</option><option value="Tertiary">Tertiary</option>
                        </select>
                      </div>
                      <div><Label className="text-xs">Gender</Label>
                        <select value={form?.gender ?? 'Co-ed'} onChange={e => setForm({ ...(form ?? {}), gender: e.target.value })} className="mt-1 w-full text-sm px-3 py-2 rounded-md border border-border bg-background">
                          <option value="Boys">Boys</option><option value="Girls">Girls</option><option value="Co-ed">Co-ed</option>
                        </select>
                      </div>
                      <div><Label className="text-xs">Initials</Label><Input value={form?.initials ?? ''} onChange={e => setForm({ ...(form ?? {}), initials: e.target.value })} className="mt-1" placeholder="e.g. QRC" /></div>
                      <div><Label className="text-xs">Established Year</Label><Input type="number" value={form?.established ?? ''} onChange={e => setForm({ ...(form ?? {}), established: e.target.value })} className="mt-1" /></div>
                      <div className="col-span-2"><Label className="text-xs">Description</Label><textarea value={form?.description ?? ''} onChange={e => setForm({ ...(form ?? {}), description: e.target.value })} className="mt-1 w-full text-sm px-3 py-2 rounded-md border border-border bg-background min-h-[60px]" /></div>
                      <div><Label className="text-xs">Website</Label><Input value={form?.website ?? ''} onChange={e => setForm({ ...(form ?? {}), website: e.target.value })} className="mt-1" /></div>
                      <div><Label className="text-xs">Phone</Label><Input value={form?.phone ?? ''} onChange={e => setForm({ ...(form ?? {}), phone: e.target.value })} className="mt-1" /></div>
                      <div className="col-span-2"><Label className="text-xs">Email</Label><Input value={form?.email ?? ''} onChange={e => setForm({ ...(form ?? {}), email: e.target.value })} className="mt-1" /></div>
                    </div>
                    <Button type="submit" loading={saving} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
                      {editing ? 'Update School' : 'Create School'}
                    </Button>
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
