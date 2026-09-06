'use client';

import { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, BookOpen, Shirt, FileText } from 'lucide-react';

export interface HomeAd {
  id: string;
  advertiserName: string;
  imageUrl: string | null;
  destinationUrl: string | null;
}

function track(adId: string, type: 'impression' | 'click') {
  try {
    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function HomeAdBanner({ ad, siteUrl }: { ad: HomeAd | null; siteUrl: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (ad && !fired.current) {
      fired.current = true;
      track(ad.id, 'impression');
    }
  }, [ad]);

  const bannerInner = (
    <div className="relative w-full min-h-[150px] sm:min-h-[160px] md:h-[170px] rounded-xl border border-black/5 shadow-sm overflow-hidden bg-white flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-center sm:text-left px-6 py-5">
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f0fe' }}>
            <BookOpen className="w-7 h-7 md:w-8 md:h-8" style={{ color: '#2563eb' }} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Books</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fce7f3' }}>
            <Shirt className="w-7 h-7 md:w-8 md:h-8" style={{ color: '#db2777' }} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Uniforms</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
            <FileText className="w-7 h-7 md:w-8 md:h-8" style={{ color: '#d97706' }} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Past Papers</span>
        </div>
      </div>
      <div>
        <h3 className="font-display font-bold text-lg md:text-2xl mb-1" style={{ color: '#663f30' }}>
          Advertise With <span style={{ color: '#FFA800' }}>MONOGRAM</span>
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm mb-3 max-w-md">
          Reach thousands of parents and students across Trinidad &amp; Tobago.
        </p>
        <span className="inline-block bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] text-xs md:text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          Get in Touch
        </span>
      </div>
    </div>
  );

  return (
    <section className="py-6 bg-background">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="relative flex items-stretch justify-center">
          {/* Get the App / QR column */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-[130px] rounded-xl border border-black/5 bg-white shadow-sm px-3 py-3 absolute left-0 top-1/2 -translate-y-1/2">
            <div className="rounded-lg border border-black/5 p-1.5 bg-white">
              <QRCodeSVG value={siteUrl} size={72} bgColor="#ffffff" fgColor="#663f30" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-[#663f30]">
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Get the App</span>
            </div>
            <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">Scan to open on mobile</span>
          </div>

          {/* Banner */}
          <div className="w-full max-w-[900px] mx-auto">
            <a href="/about" className="block">
              {bannerInner}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
