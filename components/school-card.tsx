'use client';

import Link from 'next/link';
import { MapPin, ArrowRight, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MonogramCrest } from './monogram-crest';
import { HoverLift } from '@/components/ui/animate';

interface SchoolCardProps {
  slug: string;
  name: string;
  location: string;
  type: string;
  gender: string;
  initials: string | null;
  verified?: boolean;
}

export function SchoolCard({ slug, name, location, type, gender, initials, verified }: SchoolCardProps) {
  const typeColor = type === 'Government' ? 'bg-blue-100 text-blue-800' : type === 'Denominational' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';

  return (
    <HoverLift>
      <Link href={`/schools/${slug}`} className="block group">
        <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Crest area */}
          <div className="flex items-center justify-center py-6" style={{ background: 'linear-gradient(135deg, #f5ede1, #e9dcc9)' }}>
            <MonogramCrest initials={initials ?? name?.charAt?.(0) ?? 'S'} size={72} />
          </div>
          {/* Info */}
          <div className="p-4">
            <div className="flex items-start gap-1 mb-2">
              <h3 className="font-display font-semibold text-sm leading-tight text-card-foreground group-hover:text-[#663f30] transition-colors line-clamp-2 flex-1">
                {name}
              </h3>
              {verified && <BadgeCheck className="w-4 h-4 flex-shrink-0 text-[#FFA800] mt-0.5" />}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColor}`}>{type}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">{gender}</span>
            </div>
            <div className="flex items-center text-xs font-medium group-hover:text-[#FFA800] transition-colors" style={{ color: '#663f30' }}>
              View School <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </HoverLift>
  );
}
