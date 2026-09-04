'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SchoolCard } from '@/components/school-card';
import { AnnouncementBar } from '@/components/announcement-bar';
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { HomeAdBanner, type HomeAd } from './home-ad-banner';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

interface School {
  id: string;
  slug: string;
  name: string;
  location: string;
  type: string;
  gender: string;
  initials: string | null;
  verified?: boolean;
}

function AnimatedCounter({ target, label, icon }: { target: number; label: string; icon: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/10">{icon}</div>
      <div>
        <div className="font-display font-bold text-2xl text-white">{count}</div>
        <div className="text-xs text-white/70">{label}</div>
      </div>
    </div>
  );
}

export function HomeClient({ schools, schoolCount, memberCount, ad, siteUrl }: { schools: School[]; schoolCount: number; memberCount: number; ad: HomeAd | null; siteUrl: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-pattern-brown-tile overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-[#FFA800]" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-[#FFA800]" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full border border-white/20" />
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-4 md:py-6 relative z-10">
          <SlideIn from="bottom">
            <div className="text-center max-w-2xl mx-auto">
              <img
                src="/monogram-logo.png"
                alt="Monogram crest"
                className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-0"
              />
              <h1 className="font-freezone text-5xl md:text-6xl lg:text-7xl text-white mb-4">
                MONO<span style={{ color: '#FFA800' }}>GRAM</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 font-medium mb-2">
                Your School. Your Community.
              </p>
              <p className="text-sm text-white/60 mb-8 max-w-lg mx-auto">
                Trinidad & Tobago&apos;s premier school directory — find books, uniforms, past papers and suppliers for every school.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>
                <Button type="submit" className="bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] font-semibold py-3 px-6">
                  Search
                </Button>
              </form>

              <Button asChild size="lg" className="bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] font-semibold">
                <Link href="/schools">Explore Schools <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>

              {/* Counters */}
              <div className="flex items-center justify-center gap-8 mt-10">
                <AnimatedCounter target={schoolCount} label="Schools" icon={<GraduationCap className="w-5 h-5 text-[#FFA800]" />} />
                <AnimatedCounter target={memberCount} label="Active Members" icon={<Users className="w-5 h-5 text-[#FFA800]" />} />
              </div>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* Sponsored Banner */}
      <HomeAdBanner ad={ad} siteUrl={siteUrl} />

      {/* All Schools */}
      <section className="py-16 bg-background">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ color: '#663f30' }}>
                School Directory
              </h2>
              <p className="text-muted-foreground text-sm">
                Browse Trinidad & Tobago&apos;s schools
              </p>
            </div>
          </FadeIn>

          <Stagger staggerDelay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(schools ?? []).map((school: School) => (
                <StaggerItem key={school.id}>
                  <SchoolCard slug={school.slug} name={school.name} location={school.location} type={school.type} gender={school.gender} initials={school.initials} verified={school.verified} />
                </StaggerItem>
              ))}
            </div>
          </Stagger>

          <FadeIn>
            <div className="text-center mt-10">
              <Button asChild size="lg" className="bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] font-semibold">
                <Link href="/schools">View All Schools <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
