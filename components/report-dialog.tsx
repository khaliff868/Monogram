'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Flag } from 'lucide-react';
import { toast } from 'sonner';

const reasons = [
  { value: 'scam', label: 'Scam / Fraudulent' },
  { value: 'incorrect', label: 'Incorrect Information' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'copyright', label: 'Copyright Issue' },
  { value: 'other', label: 'Other' },
];

interface Props {
  type: string; // listing | supplier | school | past_paper
  targetId: string;
  targetName: string;
  onClose: () => void;
}

export function ReportDialog({ type, targetId, targetName, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { toast.error('Please select a reason'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, targetName, reason, details }),
      });
      if (res.ok) {
        toast.success('Report submitted. Thank you!');
        onClose();
      } else if (res.status === 409) {
        toast.info('You have already reported this item');
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit report');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl w-full max-w-sm" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-bold text-sm flex items-center gap-2 text-red-600">
            <Flag className="w-4 h-4" /> Report {type === 'past_paper' ? 'Past Paper' : type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Reporting: <strong>{targetName}</strong></p>

          <div>
            <label className="text-xs font-medium mb-2 block">Reason *</label>
            <div className="space-y-1.5">
              {reasons.map(r => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-[#663f30]" />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Additional Details</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="Provide any extra context..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </div>
    </div>
  );
}
