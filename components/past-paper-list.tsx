'use client';

import { useState } from 'react';
import { FileText, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageUserButton } from '@/components/message-user-button';

interface Paper {
  id: string;
  subject: string;
  examType: string;
  year: number;
  paperNum: string | null;
  filePath: string | null;
  downloads: number;
  user?: { id: string; username: string };
}

export function PastPaperList({ papers }: { papers: Paper[] }) {
  // Group by subject then by exam type then by year
  const grouped: Record<string, Record<string, Record<number, Paper[]>>> = {};
  for (const p of papers) {
    if (!grouped[p.subject]) grouped[p.subject] = {};
    if (!grouped[p.subject][p.examType]) grouped[p.subject][p.examType] = {};
    if (!grouped[p.subject][p.examType][p.year]) grouped[p.subject][p.examType][p.year] = [];
    grouped[p.subject][p.examType][p.year].push(p);
  }

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set(Object.keys(grouped).slice(0, 2)));

  const toggleSubject = (s: string) => {
    const next = new Set(expandedSubjects);
    next.has(s) ? next.delete(s) : next.add(s);
    setExpandedSubjects(next);
  };

  const handleDownload = async (paperId: string) => {
    try {
      const res = await fetch(`/api/past-papers/${paperId}/download`);
      const data = await res.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = '';
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
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([subject, exams]) => (
        <div key={subject} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSubject(subject)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-medium text-sm" style={{ color: '#663f30' }}>{subject}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {Object.values(exams).reduce((sum, years) => sum + Object.values(years).reduce((s, ps) => s + ps.length, 0), 0)} papers
              </span>
              {expandedSubjects.has(subject) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
          {expandedSubjects.has(subject) && (
            <div className="p-3 space-y-3">
              {Object.entries(exams).sort(([a], [b]) => a.localeCompare(b)).map(([examType, years]) => (
                <div key={examType}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{examType}</p>
                  <div className="space-y-1">
                    {Object.entries(years).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearPapers]) =>
                      yearPapers.map(paper => (
                        <div key={paper.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 group">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#FFA800]" />
                            <span className="text-sm">{year}{paper.paperNum ? ` — ${paper.paperNum}` : ''}</span>
                            {paper.downloads > 0 && (
                              <span className="text-[10px] text-muted-foreground">{paper.downloads} downloads</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {paper.user?.id && (
                              <MessageUserButton
                                recipientId={paper.user.id}
                                label=""
                                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                              />
                            )}
                            {paper.filePath && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleDownload(paper.id)}>
                                <Download className="w-3.5 h-3.5 mr-1" /> Download
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
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
