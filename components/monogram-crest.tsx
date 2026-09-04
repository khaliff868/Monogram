'use client';
export function MonogramCrest({ initials, size = 80, className = '', borderColor = '#663f30' }: { initials: string; size?: number; className?: string; borderColor?: string }) {
  const displayInitials = initials ?? 'S';
  const fontSize = displayInitials?.length > 3 ? 20 : displayInitials?.length > 2 ? 26 : 34;
  return (
    <div className={className} style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 110" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M50 4 L92 18 L92 55 Q92 88 50 106 Q8 88 8 55 L8 18 Z"
          fill="#FDF6EC"
          stroke={borderColor}
          strokeWidth="5"
        />
        <path
          d="M50 4 L92 18 L92 55 Q92 88 50 106 Q8 88 8 55 L8 18 Z"
          fill="none"
          stroke="#FFA800"
          strokeWidth="2"
          transform="scale(0.92) translate(4.3, 4.8)"
        />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#663f30"
          fontFamily="serif"
          fontWeight="bold"
          fontSize={fontSize}
          letterSpacing="0.02em"
        >
          {displayInitials}
        </text>
      </svg>
    </div>
  );
}
