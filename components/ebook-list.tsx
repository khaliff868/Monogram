'use client';

import { BookMarked, Download, User as UserIcon } from 'lucide-react';
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
  user?: { id: string; username: string };
}

export function EBookList({ ebooks }: { ebooks: EBook[] }) {
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
      {ebooks.map(ebook => (
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
  );
}
