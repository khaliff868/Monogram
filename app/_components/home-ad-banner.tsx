'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (ad && !fired.current) {
      fired.current = true;
      track(ad.id, 'impression');
    }
  }, [ad]);

  if (!ad || !ad.imageUrl || imgError) return null;

  const handleClick = () => {
    track(ad.id, 'click');
  };

  const bannerInner = (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/5 shadow-sm bg-white">
      {/* SPONSORED label */}
      <div className="absolute top-0 left-0 z-10">
        <span className="inline-block bg-[#663f30]/90 text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-br-lg">
          ◁ Sponsored
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.imageUrl!}
        alt={`${ad.advertiserName} advertisement`}
        onError={() => setImgError(true)}
        className="w-full h-[120px] sm:h-[150px] md:h-[170px] object-cover"
      />
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
            {ad.destinationUrl ? (
              <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick} className="block">
                {bannerInner}
              </a>
            ) : (
              bannerInner
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
