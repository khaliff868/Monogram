'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const allCategories = [
  { value: 'BOOKS', label: 'Books' },
  { value: 'UNIFORMS', label: 'Uniforms' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'SUPPLIES', label: 'School Supplies' },
  { value: 'OTHER', label: 'Other' },
];

interface Props {
  schoolId: string;
  schoolName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSupplierDialog({ schoolId, schoolName, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    description: '',
    categories: [] as string[],
    location: '',
    phone: '',
    email: '',
    whatsApp: '',
    website: '',
  });

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) { toast.error('Business name is required'); return; }
    if (!form.categories.length) { toast.error('Select at least one category'); return; }
    if (!form.phone && !form.email && !form.whatsApp) {
      toast.error('Please provide at least one contact method');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, schoolIds: [schoolId] }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border rounded-t-xl">
          <h2 className="font-display font-bold text-lg" style={{ color: '#663f30' }}>Add Supplier</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Add a supplier for <strong>{schoolName}</strong>. Submissions go through admin review.</p>

          <div>
            <label className="text-xs font-medium mb-1 block">Business Name *</label>
            <Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Island Bookshop" />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              placeholder="What does this supplier provide?"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">Categories *</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCategory(c.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.categories.includes(c.value)
                      ? 'bg-[#663f30] text-white border-[#663f30]'
                      : 'bg-background text-foreground border-border hover:border-[#FFA800]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Location</label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. San Fernando" />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Website</label>
            <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium mb-3">Contact Information (at least one required)</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">WhatsApp</label>
                <Input value={form.whatsApp} onChange={e => setForm({ ...form, whatsApp: e.target.value })} placeholder="e.g. 18681234567" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(868) 123-4567" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@business.com" />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
            {loading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </form>
      </div>
    </div>
  );
}
