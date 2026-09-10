'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, GraduationCap, BookOpen, FileText, Loader2, MapPin, BadgeCheck } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FadeIn } from '@/components/ui/animate';

interface SchoolResult { id: string; name: string; slug: string; location: string; region: string; type: string; gender: string; initials: string | null; verified?: boolean; }
interface ListingResult { id: string; title: string; category: string; price: number | null; school: { name: string; slug: string }; }
interface PaperResult { id: string; subject: string; examType: string; year: number; paperNum: string | null; }
interface Results { schools: SchoolResult[]; listings: ListingResult[]; pastPapers: PaperResult[]; }

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams?.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ schools: [], listings: [], pastPapers: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQuery(initialQ);
    runSearch(initialQ);
  }, [initialQ, runSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const total = results ? results.schools.length + results.listings.length + results.pastPapers.length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold text-[#663f30] mb-1">Search</h1>
          <p className="text-muted-foreground mb-6">Find schools, listings and past papers.</p>
          <form onSubmit={onSubmit} className="relative mb-8">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, subject, location..."
              className="w-full pl-12 pr-4 py-3 text-base rounded-xl border border-border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800] transition"
            />
          </form>
        </FadeIn>

        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Searching...
          </div>
        )}

        {!loading && results && total === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-[#663f30]">No results found</p>
            <p className="text-muted-foreground">Try a different search term.</p>
          </div>
        )}

        {!loading && results && total > 0 && (
          <div className="space-y-10">
            {results.schools.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-[#663f30] mb-4"><GraduationCap className="w-5 h-5 text-[#FFA800]" /> Schools <span className="text-sm font-normal text-muted-foreground">({results.schools.length})</span></h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.schools.map((s) => (
                    <Link key={s.id} href={`/schools/${s.slug}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:shadow-md transition">
                      <div className="w-12 h-12 rounded-full bg-pattern-brown flex items-center justify-center text-[#FFA800] font-bold text-sm shrink-0">{s.initials || s.name.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#663f30] truncate flex items-center gap-1">{s.name}{s.verified && <BadgeCheck className="w-4 h-4 text-[#FFA800] shrink-0" />}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location} · {s.type} · {s.gender}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.listings.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-[#663f30] mb-4"><BookOpen className="w-5 h-5 text-[#FFA800]" /> Listings <span className="text-sm font-normal text-muted-foreground">({results.listings.length})</span></h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.listings.map((l) => (
                    <Link key={l.id} href={`/schools/${l.school.slug}`} className="block p-4 bg-white rounded-xl border border-border hover:shadow-md transition">
                      <p className="font-semibold text-[#663f30]">{l.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{l.category} · {l.school.name}{l.price != null ? ` · $${l.price}` : ''}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.pastPapers.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-[#663f30] mb-4"><FileText className="w-5 h-5 text-[#FFA800]" /> Past Papers <span className="text-sm font-normal text-muted-foreground">({results.pastPapers.length})</span></h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.pastPapers.map((p) => (
                    <div key={p.id} className="block p-4 bg-white rounded-xl border border-border">
                      <p className="font-semibold text-[#663f30]">{p.subject} — {p.examType} {p.year}</p>
                      {p.paperNum && <p className="text-xs text-muted-foreground mt-1">{p.paperNum}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!results && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Enter at least 2 characters to search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
