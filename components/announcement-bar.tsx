'use client';

import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: string;
  text: string;
  link: string | null;
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/announcements/active')
      .then(r => r.json())
      .then(data => setAnnouncements(data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if ((announcements?.length ?? 0) <= 1) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % (announcements?.length ?? 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements]);

  if (dismissed || (announcements?.length ?? 0) === 0) return null;

  const ann = announcements?.[current];
  if (!ann) return null;

  return (
    <div className="bg-[#fff3d6] text-[#663f30] text-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee-ltr font-medium">
              {ann.link ? (
                <Link href={ann.link} className="hover:underline">{ann.text}</Link>
              ) : (
                <span>{ann.text}</span>
              )}
              <span className="mx-8">•</span>
              <span>Stay tuned — more coming soon!</span>
            </div>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-black/10 flex-shrink-0" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
