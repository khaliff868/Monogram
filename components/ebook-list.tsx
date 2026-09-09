'use client';

import { useState } from 'react';
import { BookMarked, Download, User as UserIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageUserButton } from '@/components/message-user-button';

interface EBook {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  filePath: string | null;
  downloads: number;
  examType: string;
  user?: { id: string; username: string };
}

const EXAM_ORDER = ['SEA', 'CSEC', 'CAPE'];

export function EBookList({ ebooks }: { ebooks: EBook[] }) {
  const grouped: Record<string, EBook[]> = {};
  for (const b of ebooks) {
    const key = b.examType || 'CSEC';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  }

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const ai = EXAM_ORDER.indexOf(a);
    const bi = EXAM_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set(groupKeys.slice(0, 2)));

  const toggle = (k: string) => {
    const next = new Set(expanded);
    next.has(k) ? next.delete(k) : next.add(k);
    setExpanded(next);
  };

  const handleDownload = async (ebookId: string) => {
    try {
      const res = await fetch(`/api/ebooks/${ebookId}/download`);
      const data = await res.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = '';
        a.target = '_blank';
        a.click();
      } else {
        toast.error('File not available');
      }
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-2">
      {groupKeys.map(examType => (
        <div key={examType} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(examType)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-medium text-sm" style={{ color: '#663f30' }}>{examType}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{grouped[examType].length} e-books</span>
              {expanded.has(examType) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
          {expanded.has(examType) && (
            <div className="p-3 space-y-2">
              {grouped[examType].map(ebook => (
                <div key={ebook.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-[#FFA800]/10 flex items-center justify-center flex-shrink-0">
                      <BookMarked className="w-4 h-4 text-[#FFA800]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ebook.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {ebook.author && <span className="truncate">{ebook.author}</span>}
                        {ebook.user && (
                          <span className="flex items-center gap-0.5">
                            <UserIcon className="w-2.5 h-2.5" /> {ebook.user.username}
                          </span>
                        )}
                        {ebook.downloads > 0 && <span>{ebook.downloads} downloads</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {ebook.user?.id && (
                      <MessageUserButton
                        recipientId={ebook.user.id}
                        label=""
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                      />
                    )}
                    {ebook.filePath && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleDownload(ebook.id)}>
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
