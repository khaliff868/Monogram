'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function HeroShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.origin;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (navigator.share && isMobile) {
      try {
        await navigator.share({ title: 'Monogram', text: 'Your School. Your Community.', url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="absolute right-4 sm:right-8 top-4 z-20 flex flex-col items-center gap-1">
      <div className="relative group">
        <button
          onClick={handleShare}
          aria-label="Share Monogram"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#FFA800] to-[#E08E00] flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-orange-400/40 hover:shadow-xl active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFA800]/50"
        >
          {copied ? <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Share Monogram
        </span>
      </div>
      {copied && (
        <span className="text-xs text-white font-semibold bg-[#FFA800]/80 backdrop-blur px-2 py-1 rounded-full whitespace-nowrap">
          Link copied!
        </span>
      )}
    </div>
  );
}
