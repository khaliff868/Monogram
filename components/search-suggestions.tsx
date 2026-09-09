'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

interface SchoolSuggestion {
  id: string;
  name: string;
  slug: string;
  location: string;
  initials: string | null;
}

export function SearchSuggestions({ query }: { query: string }) {
  const [results, setResults] = useState<SchoolSuggestion[]>([]);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setShow(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults((data?.schools ?? []).slice(0, 15));
        setShow(true);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!show || results.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-border z-[100] max-h-[320px] overflow-y-auto">
      {results.map(school => (
        <button
          key={school.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShow(false);
            router.push(`/schools/${school.slug}`);
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: '#FDF6EC', color: '#663f30', border: '1.5px solid #FFA800' }}>
            {(school.initials ?? school.name?.charAt(0) ?? 'S').slice(0,3)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{school.name}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {school.location}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
