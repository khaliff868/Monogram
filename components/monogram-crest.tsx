'use client';

export function MonogramCrest({ initials, size = 80, className = '' }: { initials: string; size?: number; className?: string }) {
  const displayInitials = initials ?? 'S';
  const fontSize = displayInitials?.length > 3 ? 18 : displayInitials?.length > 2 ? 22 : 28;
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', borderRadius: '50%', backgroundImage: 'url(/pattern-brown.png)', backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid #FFA800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span
        style={{ color: '#FFA800', fontFamily: 'serif', fontWeight: 'bold', fontSize: `${fontSize * (size / 100)}px`, lineHeight: 1, letterSpacing: '0.02em', userSelect: 'none' }}
        aria-label={`${displayInitials} school crest`}
      >
        {displayInitials}
      </span>
    </div>
  );
}
