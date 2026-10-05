'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, BookOpen, Shirt, FileText, Megaphone } from 'lucide-react';

const MAX_POOL = 12;
const ROTATION_INTERVAL = 2 * 60 * 1000; // 2 minutes

interface HomeAd {
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

export function HomeAdBanner({ siteUrl }: { siteUrl: string }) {
  const [pool, setPool] = useState<HomeAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const firedFor = useRef<string | null>(null);

  // Fetch active ads once, cap pool at MAX_POOL
  useEffect(() => {
    fetch('/api/ads/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.ads && data.ads.length > 0) {
          const ads = data.ads.slice(0, MAX_POOL);
          setPool(ads);
          // Start on a random ad so visitors see every advertiser, not only the newest.
          setCurrentIndex(Math.floor(Math.random() * ads.length));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Rotate to next ad every 2 minutes
  useEffect(() => {
    if (pool.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pool.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [pool.length]);

  const currentAd = pool[currentIndex];

  // Track impression whenever the displayed ad changes
  useEffect(() => {
    if (currentAd && firedFor.current !== currentAd.id) {
      firedFor.current = currentAd.id;
      track(currentAd.id, 'impression');
    }
  }, [currentAd]);

  const handleClick = useCallback((adId: string) => {
    track(adId, 'click');
  }, []);

  const ctaInner = (
    <div className="relative w-full min-h-[150px] sm:min-h-[160px] md:h-[170px] rounded-xl border-2 shadow-sm overflow-hidden bg-white flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-center sm:text-left px-6 py-5" style={{ borderColor: '#663f30' }}>
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

  const adInner = currentAd && (
    <div className="relative w-full min-h-[150px] sm:min-h-[160px] md:h-[170px] rounded-xl border-2 shadow-sm overflow-hidden bg-white" style={{ borderColor: '#663f30' }}>
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-white/70 uppercase tracking-wider">
        <Megaphone className="w-3 h-3" />
        Sponsored
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentAd.imageUrl!}
        alt={currentAd.advertiserName}
        className="w-full h-full object-contain bg-white"
      />
    </div>
  );

  const showAd = loaded && pool.length > 0 && currentAd;
  const bannerInner = showAd ? adInner : ctaInner;
  const bannerHref = showAd ? (currentAd!.destinationUrl ?? '#') : '/about';
  const bannerOnClick = showAd ? () => handleClick(currentAd!.id) : undefined;
  const bannerTarget = showAd && currentAd!.destinationUrl ? '_blank' : undefined;

  return (
    <section className="py-6 bg-background">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="relative flex items-stretch justify-center">
          {/* Get the App / QR column */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-[130px] rounded-xl border-2 bg-white shadow-sm px-3 py-3 absolute left-0 lg:-left-4 xl:-left-16 2xl:-left-28 top-1/2 -translate-y-1/2" style={{ borderColor: '#663f30' }}>
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
            <a href={bannerHref} target={bannerTarget} rel={bannerTarget ? 'noopener noreferrer sponsored' : undefined} onClick={bannerOnClick} className="block">
              {bannerInner}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
