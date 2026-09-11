'use client';

import { useState } from 'react';
import { FileText, Download, ChevronDown, ChevronRight, FileQuestion, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageUserButton } from '@/components/message-user-button';

interface Paper {
  id: string;
  subject: string;
  examType: string;
  year: number;
  month: string | null;
  paperNum: string | null;
  paperType: string;
  filePath: string | null;
  downloads: number;
  user?: { id: string; username: string };
}

interface Row {
  year: number;
  month: string | null;
  paperNum: string | null;
  question?: Paper;
  answer?: Paper;
}

const MONTH_ORDER: Record<string, number> = { June: 2, January: 1 };

export function PastPaperList({ papers }: { papers: Paper[] }) {
  // Group by subject, then exam type, then year+month+paperNum.
  // Question and answer papers are collected into separate lists per group, then
  // paired by index so duplicate uploads (e.g. two question papers, no answer)
  // each still get their own row instead of overwriting one another.
  const grouped: Record<string, Record<string, Record<string, { year: number; month: string | null; paperNum: string | null; questions: Paper[]; answers: Paper[] }>>> = {};
  for (const p of papers) {
    const pairKey = `${p.year}__${p.month ?? ''}__${p.paperNum ?? ''}`;
    if (!grouped[p.subject]) grouped[p.subject] = {};
    if (!grouped[p.subject][p.examType]) grouped[p.subject][p.examType] = {};
    if (!grouped[p.subject][p.examType][pairKey]) {
      grouped[p.subject][p.examType][pairKey] = { year: p.year, month: p.month, paperNum: p.paperNum, questions: [], answers: [] };
    }
    if (p.paperType === 'answer') {
      grouped[p.subject][p.examType][pairKey].answers.push(p);
    } else {
      grouped[p.subject][p.examType][pairKey].questions.push(p);
    }
  }

  const buildRows = (group: Record<string, { year: number; month: string | null; paperNum: string | null; questions: Paper[]; answers: Paper[] }>): Row[] => {
    const rows: Row[] = [];
    for (const { year, month, paperNum, questions, answers } of Object.values(group)) {
      const count = Math.max(questions.length, answers.length, 1);
      for (let i = 0; i < count; i++) {
        rows.push({ year, month, paperNum, question: questions[i], answer: answers[i] });
      }
    }
    return rows.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (MONTH_ORDER[b.month ?? ''] ?? 0) - (MONTH_ORDER[a.month ?? ''] ?? 0);
    });
  };

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

  const renderSide = (paper: Paper | undefined, label: string, icon: React.ReactNode) => {
    if (!paper) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-md border border-dashed border-border text-muted-foreground">
          {icon}
          <span className="text-[11px]">{label} not available</span>
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-md border border-border bg-muted/20">
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#663f30' }}>
          {icon} {label}
        </div>
        <div className="flex items-center gap-1">
          {paper.user?.id && (
            <MessageUserButton
              recipientId={paper.user.id}
              label=""
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
            />
          )}
          {paper.filePath && (
            <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2" onClick={() => handleDownload(paper.id)}>
              <Download className="w-3 h-3 mr-1" /> Download
            </Button>
          )}
        </div>
        {paper.downloads > 0 && <span className="text-[10px] text-muted-foreground">{paper.downloads} downloads</span>}
      </div>
    );
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
                {Object.values(exams).reduce((sum, group) => sum + buildRows(group).length, 0)} papers
              </span>
              {expandedSubjects.has(subject) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
          {expandedSubjects.has(subject) && (
            <div className="p-3 space-y-3">
              {Object.entries(exams).sort(([a], [b]) => a.localeCompare(b)).map(([examType, group]) => (
                <div key={examType}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{examType}</p>
                  <div className="space-y-2">
                    {buildRows(group).map((row, i) => (
                      <div key={`${row.year}__${row.month ?? ''}__${row.paperNum ?? ''}__${i}`} className="rounded-md border border-border p-2">
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <FileText className="w-3.5 h-3.5 text-[#FFA800]" />
                          <span className="text-sm font-medium">{row.year}{row.month ? ` - ${row.month}` : ''}{row.paperNum ? ` — ${row.paperNum}` : ''}</span>
                        </div>
                        <div className="flex gap-2">
                          {renderSide(row.question, 'Question Paper', <FileQuestion className="w-3.5 h-3.5" />)}
                          {renderSide(row.answer, 'Answer Paper', <FileCheck className="w-3.5 h-3.5" />)}
                        </div>
                      </div>
                    ))}
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
