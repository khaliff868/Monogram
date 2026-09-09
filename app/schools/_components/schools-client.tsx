'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SchoolCard } from '@/components/school-card';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { SearchSuggestions } from '@/components/search-suggestions';

interface School {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  type: string;
  gender: string;
  initials: string | null;
  verified?: boolean;
  level?: string;
}

const REGIONS = ['All Regions', 'Port of Spain', 'San Fernando', 'Arima', 'Chaguanas', 'Diego Martin', 'South Trinidad', 'Tobago', 'Central Trinidad', 'St. Augustine'];
const TYPES = ['All Types', 'Government', 'Denominational', 'Private', 'Tertiary'];
const LEVELS = ['All Levels', 'Primary', 'Secondary', 'Tertiary'];
const GENDERS = ['All', 'Boys', 'Girls', 'Co-ed'];
const SORTS = ['A-Z', 'Z-A'];

export function SchoolsClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get?.('q') ?? '';

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQ);
  const [region, setRegion] = useState('All Regions');
  const [type, setType] = useState('All Types');
  const [level, setLevel] = useState('All Levels');
  const [gender, setGender] = useState('All');
  const [sort, setSort] = useState('A-Z');
  const [showFilters, setShowFilters] = useState(false);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (region !== 'All Regions') params.set('region', region);
      if (type !== 'All Types') params.set('type', type);
      if (level !== 'All Levels') params.set('level', level);
      if (gender !== 'All') params.set('gender', gender);
      params.set('sort', sort);
      const res = await fetch(`/api/schools?${params.toString()}`);
      const data = await res.json();
      setSchools(data ?? []);
    } catch {
      setSchools([]);
    }
    setLoading(false);
  }, [query, region, type, level, gender, sort]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-[#663f30] to-[#0f1d3d] py-10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">School Directory</h1>
          <p className="text-white/70 text-sm">Find your school across Trinidad & Tobago</p>
        </div>
      </section>

      <section className="py-8 bg-background flex-1">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Search & Filter bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search schools..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#663f30]"
              />
              <SearchSuggestions query={query} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
            </Button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <FadeIn>
              <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg bg-muted">
                <select value={region} onChange={e => setRegion(e.target.value)} className="text-sm px-3 py-1.5 rounded-md border border-border bg-card">
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={type} onChange={e => setType(e.target.value)} className="text-sm px-3 py-1.5 rounded-md border border-border bg-card">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={level} onChange={e => setLevel(e.target.value)} className="text-sm px-3 py-1.5 rounded-md border border-border bg-card">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={gender} onChange={e => setGender(e.target.value)} className="text-sm px-3 py-1.5 rounded-md border border-border bg-card">
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm px-3 py-1.5 rounded-md border border-border bg-card">
                  {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </FadeIn>
          )}

          {/* Results count */}
          <p className="text-xs text-muted-foreground mb-4">{schools?.length ?? 0} schools found</p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (schools?.length ?? 0) === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No schools found matching your criteria.</p>
            </div>
          ) : (
            <Stagger staggerDelay={0.03}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(schools ?? []).map((school: School) => (
                  <StaggerItem key={school.id}>
                    <SchoolCard
                      slug={school.slug}
                      name={school.name}
                      location={school.location}
                      type={school.type}
                      gender={school.gender}
                      initials={school.initials}
                      verified={school.verified}
                      level={school.level}
                    />
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
