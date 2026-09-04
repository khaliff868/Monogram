'use client';

import { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone } from 'lucide-react';

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
    <div
      className="relative w-full h-[120px] sm:h-[150px] md:h-[170px] rounded-xl border border-black/5 shadow-sm flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'linear-gradient(135deg, #663f30, #4a2d22)' }}
    >
      <h3 className="font-display font-bold text-white text-lg md:text-2xl mb-1">
        Advertise With <span style={{ color: '#FFA800' }}>MONOGRAM</span>
      </h3>
      <p className="text-white/70 text-xs md:text-sm mb-3 max-w-md">
        Reach thousands of parents and students across Trinidad &amp; Tobago.
      </p>
      <span className="inline-block bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] text-xs md:text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
        Get in Touch
      </span>
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
