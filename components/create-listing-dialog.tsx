'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'BOOKS', label: 'Books' },
  { value: 'UNIFORMS', label: 'Uniforms' },
  { value: 'SHOES', label: 'Shoes' },
];

const conditions = ['New', 'Like New', 'Used'];

interface Props {
  schoolId: string;
  schoolName: string;
  category: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateListingDialog({ schoolId, schoolName, category, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category,
    condition: '',
    price: '',
    contactPhone: '',
    contactEmail: '',
    contactWhatsApp: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.contactPhone && !form.contactEmail && !form.contactWhatsApp) {
      toast.error('Please provide at least one contact method');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, schoolId, price: form.price || undefined }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create listing');
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
          <h2 className="font-display font-bold text-lg" style={{ color: '#663f30' }}>Add Listing</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Listing for <strong>{schoolName}</strong>. All listings go through admin review before appearing.</p>

          <div>
            <label className="text-xs font-medium mb-1 block">Title *</label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mathematics Textbook Form 3" />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              placeholder="Describe the item, its condition, edition, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              >
                <option value="">Select...</option>
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Price (TT$) — optional</label>
            <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium mb-3">Contact Information (at least one required)</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">WhatsApp Number</label>
                <Input value={form.contactWhatsApp} onChange={e => setForm({ ...form, contactWhatsApp: e.target.value })} placeholder="e.g. 18681234567" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                <Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="e.g. (868) 123-4567" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <Input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="your@email.com" />
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
