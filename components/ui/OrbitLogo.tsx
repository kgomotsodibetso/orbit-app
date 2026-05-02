import React from 'react';

interface OrbitMarkProps {
  width?: number;
  /** Use dark-on-dark variant (sidebar, login page dark backgrounds) */
  dark?: boolean;
}

interface OrbitLogoProps {
  markWidth?: number;
  showWordmark?: boolean;
  layout?: 'inline' | 'stacked';
  /** Colour scheme for the wordmark text */
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Gradient "O" mark — V1 Cool Diagonal (Lavender → Steel → Ink)
 * The ring arc and golden dot reference the orbital motion of the brand.
 */
export function OrbitMark({ width = 56, dark = false }: OrbitMarkProps) {
  const sfx = dark ? 'd' : 'l';
  const bodyEnd   = dark ? '#2C3A47' : '#1C2830';
  const innerFrom = dark ? '#303F4C' : '#F9F5F1';
  const innerTo   = dark ? '#2C3A47' : '#F5F1ED';
  const dotColor  = dark ? '#FFD060' : '#F6B93B';
  const arcEnd    = dark ? 'rgba(255,208,96,0.35)' : 'rgba(246,185,59,0.4)';

  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`om-body-${sfx}`} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#C4C0FB" />
          <stop offset="38%"  stopColor="#4B8EBA" />
          <stop offset="100%" stopColor={bodyEnd} />
        </linearGradient>
        <linearGradient id={`om-arc-${sfx}`} x1="10" y1="35" x2="150" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.95)" />
          <stop offset="40%"  stopColor={dotColor} />
          <stop offset="100%" stopColor={arcEnd} />
        </linearGradient>
        <radialGradient id={`om-inner-${sfx}`} cx="40%" cy="36%" r="62%">
          <stop offset="0%"   stopColor={innerFrom} />
          <stop offset="100%" stopColor={innerTo} />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill={`url(#om-body-${sfx})`} />
      <circle cx="80" cy="80" r="44" fill={`url(#om-inner-${sfx})`} />
      <ellipse
        cx="80" cy="80" rx="92" ry="23"
        stroke={`url(#om-arc-${sfx})`}
        strokeWidth="7.5"
        fill="none"
        strokeLinecap="round"
        transform="rotate(-40 80 80)"
      />
      <circle cx="140" cy="42" r="9.5" fill={dotColor} />
      <circle cx="138" cy="40" r="3.8" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}

/** Full logo lockup: gradient O mark + wordmark */
export default function OrbitLogo({
  markWidth = 52,
  showWordmark = true,
  layout = 'inline',
  variant = 'light',
  className = '',
}: OrbitLogoProps) {
  const isDark = variant === 'dark';
  const titleColor    = isDark ? '#F0E5DF' : '#1C2830';
  const subtitleColor = isDark ? 'rgba(240,229,223,0.42)' : '#9aabb8';

  if (!showWordmark) {
    return (
      <span className={className}>
        <OrbitMark width={markWidth} dark={isDark} />
      </span>
    );
  }

  return (
    <span
      className={[
        'flex',
        layout === 'stacked' ? 'flex-col items-center gap-3' : 'items-center gap-3',
        className,
      ].join(' ')}
    >
      <OrbitMark width={markWidth} dark={isDark} />
      <span className="flex flex-col" style={{ lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.4px',
            color: titleColor,
          }}
        >
          Orbit
        </span>
        <span
          style={{
            fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
            fontWeight: 600,
            fontSize: 7.5,
            letterSpacing: '2.8px',
            textTransform: 'uppercase',
            color: subtitleColor,
            marginTop: 3,
          }}
        >
          Library Management System
        </span>
      </span>
    </span>
  );
}
