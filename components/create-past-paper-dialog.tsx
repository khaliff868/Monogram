'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPastPaperFile } from '@/lib/supabase-client';
import { FileText, Loader2 } from 'lucide-react';

const examTypes = ['CSEC', 'CAPE', 'SEA', 'Internal'];
const subjects = [
  'Mathematics', 'English Language', 'English Literature', 'Physics', 'Chemistry',
  'Biology', 'Integrated Science', 'Social Studies', 'History', 'Geography',
  'Spanish', 'French', 'Information Technology', 'Visual Arts', 'Music',
  'Physical Education', 'Agricultural Science', 'Economics', 'Accounting',
  'Principles of Business', 'Technical Drawing', 'Food & Nutrition', 'Other',
];

interface Props {
  schoolId: string;
  schoolName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePastPaperDialog({ schoolId, schoolName, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    subject: '',
    examType: 'CSEC',
    year: '2026',
    paperNum: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject) { toast.error('Subject is required'); return; }
    if (!form.year) { toast.error('Year is required'); return; }
    if (files.length === 0) { toast.error('Please select at least one file'); return; }
    setLoading(true);
    try {
      let successCount = 0;
      for (const file of files) {
        try {
          const filePath = await uploadPastPaperFile(file);
          const res = await fetch('/api/past-papers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, schoolId, filePath }),
          });
          if (res.ok) successCount++;
        } catch {
          // continue with remaining files
        }
      }
      if (successCount > 0) {
        onCreated();
      } else {
        toast.error('Failed to submit past papers');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const MAX_FILES = 5;
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (files.length + selected.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} files at once`);
      const remaining = MAX_FILES - files.length;
      setFiles(prev => [...prev, ...selected.slice(0, Math.max(0, remaining))]);
    } else {
      setFiles(prev => [...prev, ...selected]);
    }
    e.target.value = '';
  };

  const years = Array.from({ length: 30 }, (_, i) => 2026 - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border rounded-t-xl">
          <h2 className="font-display font-bold text-lg" style={{ color: '#663f30' }}>Add Past Paper</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Submit a past paper for <strong>{schoolName}</strong>. Papers go through admin review.</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-md p-2">Please ensure you have permission to share this paper. Do not upload copyrighted material without authorization.</p>

          <div>
            <label className="text-xs font-medium mb-1 block">Subject *</label>
            <select
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
            >
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Exam Type *</label>
              <select
                value={form.examType}
                onChange={e => setForm({ ...form, examType: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              >
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Year *</label>
              <select
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Paper Number</label>
            <Input value={form.paperNum} onChange={e => setForm({ ...form, paperNum: e.target.value })} placeholder="e.g. Paper 1, Paper 2" />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Files * (up to 5)</label>
            <div className="space-y-2 mb-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded-md px-2 py-1.5">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {files.length < 5 && (
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-md py-2.5 text-xs text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                <FileText className="w-4 h-4" />
                Select file(s) to upload
                <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleFileSelect} />
              </label>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin inline" />Submitting...</>) : 'Submit for Review'}
          </Button>
        </form>
      </div>
    </div>
  );
}
