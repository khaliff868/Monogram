'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadEbookFile } from '@/lib/supabase-client';

interface Props {
  schoolId: string;
  schoolName: string;
  onClose: () => void;
  onCreated: () => void;
}

interface FileEntry {
  file: File;
  title: string;
  author: string;
}

export function CreateEbookDialog({ schoolId, schoolName, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const MAX_FILES = 5;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const remaining = MAX_FILES - entries.length;
    if (selected.length > remaining) {
      toast.error(`You can upload up to ${MAX_FILES} files at once`);
    }
    const toAdd = selected.slice(0, Math.max(0, remaining)).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      author: '',
    }));
    setEntries(prev => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const updateEntry = (index: number, field: 'title' | 'author', value: string) => {
    setEntries(prev => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entries.length === 0) { toast.error('Please select at least one file'); return; }
    if (entries.some(entry => !entry.title.trim())) { toast.error('Each e-book needs a title'); return; }
    setLoading(true);
    try {
      let successCount = 0;
      for (const entry of entries) {
        try {
          const filePath = await uploadEbookFile(entry.file);
          const res = await fetch('/api/ebooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: entry.title.trim(),
              author: entry.author.trim() || undefined,
              filePath,
              schoolId,
            }),
          });
          if (res.ok) successCount++;
        } catch {
          // continue with remaining files
        }
      }
      if (successCount > 0) {
        onCreated();
      } else {
        toast.error('Failed to submit e-books');
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
          <h2 className="font-display font-bold text-lg" style={{ color: '#663f30' }}>Add E-Book</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Share an e-book for <strong>{schoolName}</strong>. Submissions go through admin review.</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-md p-2">Please ensure you have permission to share this file. Do not upload copyrighted material without authorization.</p>

          <div>
            <label className="text-xs font-medium mb-1 block">Files * (up to 5)</label>
            <div className="space-y-3 mb-2">
              {entries.map((entry, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{entry.file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeEntry(i)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    value={entry.title}
                    onChange={e => updateEntry(i, 'title', e.target.value)}
                    placeholder="Title *"
                    className="text-sm"
                  />
                  <Input
                    value={entry.author}
                    onChange={e => updateEntry(i, 'author', e.target.value)}
                    placeholder="Author (optional)"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
            {entries.length < 5 && (
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-md py-2.5 text-xs text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                <FileText className="w-4 h-4" />
                Select file(s) to upload
                <input type="file" accept=".pdf,.epub" multiple className="hidden" onChange={handleFileSelect} />
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
