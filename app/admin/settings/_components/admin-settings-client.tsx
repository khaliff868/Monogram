'use client';

import { useState } from 'react';
import { AdminSidebar } from '../../_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/ui/animate';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  facebook: string;
  instagram: string;
  twitter: string;
  featuredEnabled: boolean;
}

export function AdminSettingsClient({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Settings saved');
        router.refresh();
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Site Settings</h1>
              <div className="bg-card rounded-xl p-6 max-w-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
                <form onSubmit={handleSave} className="space-y-4">
                  <div><Label className="text-xs">Site Name</Label><Input value={form?.siteName ?? ''} onChange={e => setForm({ ...(form ?? {} as any), siteName: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">Tagline</Label><Input value={form?.tagline ?? ''} onChange={e => setForm({ ...(form ?? {} as any), tagline: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">Contact Email</Label><Input value={form?.contactEmail ?? ''} onChange={e => setForm({ ...(form ?? {} as any), contactEmail: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">Facebook URL</Label><Input value={form?.facebook ?? ''} onChange={e => setForm({ ...(form ?? {} as any), facebook: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">Instagram URL</Label><Input value={form?.instagram ?? ''} onChange={e => setForm({ ...(form ?? {} as any), instagram: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">Twitter/X URL</Label><Input value={form?.twitter ?? ''} onChange={e => setForm({ ...(form ?? {} as any), twitter: e.target.value })} className="mt-1" /></div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form?.featuredEnabled ?? true} onChange={e => setForm({ ...(form ?? {} as any), featuredEnabled: e.target.checked })} />
                    <span className="text-xs">Show Featured Schools on Homepage</span>
                  </div>
                  <Button type="submit" loading={saving} className="bg-[#663f30] hover:bg-[#533226] text-white">
                    <Save className="w-4 h-4 mr-1" /> Save Settings
                  </Button>
                </form>
              </div>
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
