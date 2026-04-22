import React from 'react';

interface OrbitLogoProps {
  /** Width of the bookshelf mark in pixels */
  markWidth?: number;
  /** Show the wordmark ("Orbit" + subtitle) alongside the mark */
  showWordmark?: boolean;
  /** Layout when wordmark is shown */
  layout?: 'inline' | 'stacked';
  /** Colour scheme for the wordmark text */
  variant?: 'dark' | 'light';
  className?: string;
}

/** Five-Spines bookshelf mark — one spine per brand colour */
export function OrbitMark({ width = 56 }: { width?: number }) {
  const h = Math.round(width * (100 / 140));
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="olLav"   x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4C0FB"/><stop offset="100%" stopColor="#7470BE"/></linearGradient>
        <linearGradient id="olSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6AADD4"/><stop offset="100%" stopColor="#2E6A90"/></linearGradient>
        <linearGradient id="olSlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3D5060"/><stop offset="100%" stopColor="#141E26"/></linearGradient>
        <linearGradient id="olGold"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD060"/><stop offset="100%" stopColor="#A86808"/></linearGradient>
        <linearGradient id="olCream" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FAF3ED"/><stop offset="100%" stopColor="#C0B0A6"/></linearGradient>
        <linearGradient id="olCurve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.38)"/>
          <stop offset="14%"  stopColor="rgba(0,0,0,0.04)"/>
          <stop offset="35%"  stopColor="rgba(255,255,255,0.09)"/>
          <stop offset="78%"  stopColor="rgba(0,0,0,0.02)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)"/>
        </linearGradient>
        <linearGradient id="olSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.12)"/>
          <stop offset="40%"  stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
        </linearGradient>
        <linearGradient id="olCstA" x1="22" y1="0" x2="28" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="rgba(0,0,0,0.28)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
        <linearGradient id="olCstB" x1="44" y1="0" x2="52" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="rgba(0,0,0,0.28)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
        <linearGradient id="olCstC" x1="69" y1="0" x2="78" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="rgba(0,0,0,0.32)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
        <linearGradient id="olCstD" x1="93" y1="0" x2="101" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="rgba(0,0,0,0.28)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
      </defs>

      {/* Shelf board */}
      <rect x="0" y="95" width="140" height="5" rx="1" fill="#0E1820"/>
      <rect x="0" y="95" width="140" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>

      {/* Book 1 — Lavender */}
      <rect x="4"  y="42" width="18" height="53" rx="1.5" fill="url(#olLav)"/>
      <rect x="4"  y="42" width="18" height="53" rx="1.5" fill="url(#olCurve)"/>
      <rect x="4"  y="42" width="18" height="53" rx="1.5" fill="url(#olSheen)"/>
      <rect x="5"  y="40" width="16" height="3.5" rx="0.8" fill="#E5DDD6"/>
      <line x1="5" y1="41" x2="21" y2="41" stroke="#CEC6BE" strokeWidth="0.4"/>
      <line x1="5" y1="42" x2="21" y2="42" stroke="#CEC6BE" strokeWidth="0.4"/>
      <rect x="6"  y="49"  width="14" height="2.5" rx="0.5" fill="rgba(255,255,255,0.22)"/>
      <rect x="6"  y="53.5" width="14" height="1.4" rx="0.5" fill="rgba(255,255,255,0.13)"/>
      <rect x="6"  y="56.5" width="10" height="1.4" rx="0.5" fill="rgba(255,255,255,0.09)"/>
      <rect x="6"  y="87"  width="14" height="1.5" rx="0.5" fill="rgba(255,255,255,0.14)"/>
      <rect x="22" y="42"  width="8"  height="53" fill="url(#olCstA)"/>

      {/* Book 2 — Steel */}
      <rect x="24" y="28" width="20" height="67" rx="1.5" fill="url(#olSteel)"/>
      <rect x="24" y="28" width="20" height="67" rx="1.5" fill="url(#olCurve)"/>
      <rect x="24" y="28" width="20" height="67" rx="1.5" fill="url(#olSheen)"/>
      <rect x="25" y="25.5" width="18" height="4" rx="0.8" fill="#E5DDD6"/>
      <line x1="25" y1="27" x2="43" y2="27" stroke="#CEC6BE" strokeWidth="0.4"/>
      <line x1="25" y1="28" x2="43" y2="28" stroke="#CEC6BE" strokeWidth="0.4"/>
      <rect x="27" y="36"  width="16" height="2.5" rx="0.5" fill="rgba(255,255,255,0.24)"/>
      <rect x="27" y="40.5" width="16" height="1.4" rx="0.5" fill="rgba(255,255,255,0.14)"/>
      <rect x="27" y="43.5" width="11" height="1.4" rx="0.5" fill="rgba(255,255,255,0.1)"/>
      <rect x="24" y="84"  width="20" height="11" rx="1.5" fill="rgba(0,0,0,0.18)"/>
      <rect x="27" y="86.5" width="14" height="1.4" rx="0.5" fill="rgba(255,255,255,0.18)"/>
      <rect x="44" y="28"  width="10" height="67" fill="url(#olCstB)"/>

      {/* Book 3 — Slate (tallest, centre) */}
      <rect x="47" y="6"  width="22" height="89" rx="1.5" fill="url(#olSlate)"/>
      <rect x="47" y="6"  width="22" height="89" rx="1.5" fill="url(#olCurve)"/>
      <rect x="47" y="6"  width="22" height="89" rx="1.5" fill="url(#olSheen)"/>
      <rect x="48" y="3.5" width="20" height="4"  rx="0.8" fill="#E5DDD6"/>
      <line x1="48" y1="5" x2="68" y2="5" stroke="#CEC6BE" strokeWidth="0.4"/>
      <line x1="48" y1="6" x2="68" y2="6" stroke="#CEC6BE" strokeWidth="0.4"/>
      {/* Golden accent band at top of centre book */}
      <rect x="47" y="6"  width="22" height="9"  rx="1.5" fill="#F6B93B"/>
      <rect x="47" y="12" width="22" height="3"  fill="#D4940A" opacity="0.35"/>
      <rect x="50" y="21"  width="16" height="2.5" rx="0.5" fill="rgba(255,255,255,0.28)"/>
      <rect x="50" y="25.5" width="16" height="1.4" rx="0.5" fill="rgba(255,255,255,0.16)"/>
      <rect x="50" y="28.5" width="12" height="1.4" rx="0.5" fill="rgba(255,255,255,0.1)"/>
      <rect x="50" y="55"  width="16" height="0.8" rx="0.4" fill="rgba(255,255,255,0.1)"/>
      <rect x="47" y="84"  width="22" height="11" rx="1.5" fill="rgba(0,0,0,0.2)"/>
      <rect x="50" y="86.5" width="16" height="1.4" rx="0.5" fill="rgba(255,255,255,0.18)"/>
      <rect x="69" y="6"   width="10" height="89" fill="url(#olCstC)"/>

      {/* Book 4 — Golden */}
      <rect x="72" y="22" width="20" height="73" rx="1.5" fill="url(#olGold)"/>
      <rect x="72" y="22" width="20" height="73" rx="1.5" fill="url(#olCurve)"/>
      <rect x="72" y="22" width="20" height="73" rx="1.5" fill="url(#olSheen)"/>
      <rect x="73" y="19.5" width="18" height="4" rx="0.8" fill="#E5DDD6"/>
      <line x1="73" y1="21" x2="91" y2="21" stroke="#CEC6BE" strokeWidth="0.4"/>
      <line x1="73" y1="22" x2="91" y2="22" stroke="#CEC6BE" strokeWidth="0.4"/>
      <rect x="75" y="30"  width="16" height="2.5" rx="0.5" fill="rgba(0,0,0,0.2)"/>
      <rect x="75" y="34.5" width="16" height="1.4" rx="0.5" fill="rgba(0,0,0,0.12)"/>
      <rect x="75" y="37.5" width="11" height="1.4" rx="0.5" fill="rgba(0,0,0,0.08)"/>
      <rect x="75" y="60"  width="16" height="0.8" rx="0.4" fill="rgba(0,0,0,0.1)"/>
      <rect x="72" y="84"  width="20" height="11" rx="1.5" fill="rgba(0,0,0,0.14)"/>
      <rect x="75" y="86.5" width="14" height="1.4" rx="0.5" fill="rgba(0,0,0,0.2)"/>
      <rect x="92" y="22"  width="9"  height="73" fill="url(#olCstD)"/>

      {/* Book 5 — Cream */}
      <rect x="94" y="38" width="18" height="57" rx="1.5" fill="url(#olCream)"/>
      <rect x="94" y="38" width="18" height="57" rx="1.5" fill="url(#olCurve)"/>
      <rect x="94" y="38" width="18" height="57" rx="1.5" fill="url(#olSheen)"/>
      <rect x="95" y="35.5" width="16" height="4"  rx="0.8" fill="#E5DDD6"/>
      <line x1="95" y1="37"  x2="111" y2="37"  stroke="#CEC6BE" strokeWidth="0.4"/>
      <line x1="95" y1="38"  x2="111" y2="38"  stroke="#CEC6BE" strokeWidth="0.4"/>
      <rect x="97" y="46"  width="13" height="2.5" rx="0.5" fill="rgba(44,58,71,0.22)"/>
      <rect x="97" y="50.5" width="13" height="1.4" rx="0.5" fill="rgba(44,58,71,0.13)"/>
      <rect x="97" y="53.5" width="9"  height="1.4" rx="0.5" fill="rgba(44,58,71,0.09)"/>
      <rect x="94" y="38"  width="18" height="6"  rx="1.5" fill="rgba(44,58,71,0.18)"/>
      <rect x="94" y="38"  width="18" height="3.5" rx="1.5" fill="rgba(44,58,71,0.25)"/>
      <rect x="94" y="84"  width="18" height="11" rx="1.5" fill="rgba(44,58,71,0.1)"/>
      <rect x="97" y="86.5" width="13" height="1.4" rx="0.5" fill="rgba(44,58,71,0.2)"/>

      {/* Ambient occlusion under all books */}
      <rect x="4" y="93" width="108" height="2" rx="1" fill="rgba(0,0,0,0.18)"/>
    </svg>
  );
}

/** Full logo lockup: bookshelf mark + wordmark */
export default function OrbitLogo({
  markWidth = 52,
  showWordmark = true,
  layout = 'inline',
  variant = 'light',
  className = '',
}: OrbitLogoProps) {
  const titleColor = variant === 'dark' ? '#F0E5DF' : '#1C2830';
  const subtitleColor = variant === 'dark' ? 'rgba(240,229,223,0.42)' : '#9aabb8';

  if (!showWordmark) {
    return (
      <span className={className}>
        <OrbitMark width={markWidth} />
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
      <OrbitMark width={markWidth} />
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
