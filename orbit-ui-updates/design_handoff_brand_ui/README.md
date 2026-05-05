# Handoff: Orbit Library — Brand UI Update

## Overview

This package contains design references and implementation instructions for updating the Orbit Library Management System UI to match the finalised brand guide. The brand identity has been fully specified and a new logo mark (`OrbitLogo`) has already been partially implemented in the codebase. This handoff covers the remaining gaps.

---

## About the Design Files

The files in this bundle are **HTML design references** created during a brand design session — not production code to be shipped directly. Your task is to **recreate the specified designs in the existing Next.js / Tailwind codebase** using its established patterns and components.

Reference files included:

| File | Purpose |
|---|---|
| `Orbit Brand Guide.html` | Full brand guide — colours, type, logo, tokens, do/don't, UI preview |
| `Orbit Logo.html` | Logo exploration showing all mark variants and favicon sizes |

Open these in a browser to see the intended output at full fidelity.

---

## Fidelity

**High-fidelity.** The brand guide defines exact hex values, gradient stops, typography specs, border radius tokens, and component patterns. Implement to pixel spec.

---

## Current State Assessment

Most of the brand foundation is **already correct** in the codebase:

| Area | Status | Notes |
|---|---|---|
| `app/globals.css` — colour tokens | ✅ Correct | Steel, Golden, Lavender, Cream, Slate all defined |
| `app/layout.tsx` — Montserrat font | ✅ Correct | Weight 400–900, swap display |
| `components/ui/OrbitLogo.tsx` | ✅ Correct | Five-spines bookshelf mark with all gradients |
| `components/ui/CollapsibleSidebar.tsx` | ✅ Correct | Already uses `<OrbitLogo markWidth={40} variant="dark" />` |
| `app/(auth)/login/page.tsx` | ✅ Correct | Already uses `<OrbitLogo markWidth={80} showWordmark={false} />` |
| `components/ui/DashboardShell.tsx` | ❌ Needs update | Mobile header still uses Lucide `<Rocket>` icon |
| `public/favicon.svg` | ❌ Needs update | Still the old mark |
| `public/icons/icon.svg` | ❌ Needs update | Still the old mark |
| `public/icons/icon-192.png` | ❌ Needs regeneration | Rasterise new SVG icon at 192×192 |
| `public/icons/icon-512.png` | ❌ Needs regeneration | Rasterise new SVG icon at 512×512 |
| `public/icons/apple-touch-icon.png` | ❌ Needs regeneration | Rasterise at 180×180 |
| `public/favicon.png` | ❌ Needs regeneration | Rasterise at 32×32 |

---

## Changes Required

### 1. `components/ui/DashboardShell.tsx` — Mobile Header Logo

**Current:** Uses `<Rocket>` from lucide-react inside a Steel circle.

**Replace** the mobile header logo block with `<OrbitMark>`:

```tsx
// Remove this import:
import { Menu, Rocket } from 'lucide-react';
// Change to:
import { Menu } from 'lucide-react';
import { OrbitMark } from '@/components/ui/OrbitLogo';
```

Replace the logo markup in the mobile top bar:

```tsx
{/* Before */}
<div className="flex items-center gap-2">
  <div className="w-6 h-6 rounded-md bg-steel flex items-center justify-center">
    <Rocket className="w-3.5 h-3.5 text-white" />
  </div>
  <span className="font-bold text-sm text-cream tracking-wide">Orbit Tech</span>
</div>

{/* After */}
<div className="flex items-center gap-2">
  <OrbitMark width={28} />
  <span className="font-bold text-sm text-cream tracking-wide">Orbit</span>
</div>
```

---

### 2. `public/favicon.svg` — Browser Tab Icon

Replace the entire file with this SVG. It renders the bookshelf mark inside a rounded-square Slate container, matching the brand favicon spec:

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" fill="#1C2830"/>
  <rect x="0" y="29" width="32" height="3" fill="#0E1820"/>
  <!-- Lavender spine -->
  <rect x="2"  y="15" width="5"  height="14" rx="1" fill="#A29FEC"/>
  <!-- Steel spine -->
  <rect x="8"  y="10" width="6"  height="19" rx="1" fill="#4B8EBA"/>
  <!-- Slate spine (tallest) + golden band -->
  <rect x="15" y="4"  width="8"  height="25" rx="1" fill="#F0E5DF"/>
  <rect x="15" y="4"  width="8"  height="5"  rx="1" fill="#F6B93B"/>
  <!-- Golden spine -->
  <rect x="24" y="8"  width="6"  height="21" rx="1" fill="#F6B93B" opacity="0.85"/>
</svg>
```

---

### 3. `public/icons/icon.svg` — PWA Icon (SVG)

Replace with a 512×512 equivalent of the favicon mark. Use the same structure but scaled up:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#1C2830"/>
  <rect x="0" y="460" width="512" height="52" rx="0" fill="#0E1820"/>
  <!-- Lavender spine -->
  <rect x="32"  y="240" width="80"  height="220" rx="12" fill="#A29FEC"/>
  <!-- Steel spine -->
  <rect x="128" y="160" width="96"  height="300" rx="12" fill="#4B8EBA"/>
  <!-- Slate centre spine (tallest) -->
  <rect x="240" y="64"  width="112" height="396" rx="12" fill="#F0E5DF"/>
  <!-- Golden band top of centre -->
  <rect x="240" y="64"  width="112" height="80"  rx="12" fill="#F6B93B"/>
  <!-- Golden spine -->
  <rect x="368" y="128" width="96"  height="332" rx="12" fill="#F6B93B" opacity="0.85"/>
</svg>
```

---

### 4. PNG Icon Regeneration

The `.png` icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png`) need to be rasterised from the SVG above.

**Recommended approach — use a Node script or sharp:**

```bash
# Install sharp if not present
npm install --save-dev sharp

# Then run a quick script:
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/icons/icon.svg');
sharp(svg).resize(192,192).png().toFile('public/icons/icon-192.png', ()=>{});
sharp(svg).resize(512,512).png().toFile('public/icons/icon-512.png', ()=>{});
sharp(svg).resize(180,180).png().toFile('public/icons/apple-touch-icon.png', ()=>{});
sharp(svg).resize(32,32).png().toFile('public/favicon.png', ()=>{});
"
```

Or use any SVG-to-PNG tool (Inkscape CLI, Figma export, etc.).

---

## Design Tokens (already in globals.css — do not change)

| Token | Value | Usage |
|---|---|---|
| `--color-steel` | `#4B8EBA` | Primary · nav · links · focus ring |
| `--color-golden` | `#F6B93B` | Accent · badges · achievements |
| `--color-lavender` | `#A29FEC` | AI / assistant features |
| `--color-cream` | `#F0E5DF` | Light surfaces · card backgrounds |
| `--color-slate` | `#2C3A47` | Dark bg · sidebar · body text |
| `--color-success` | `#22c55e` | Returned · active states |
| `--color-warning` | `#f59e0b` | Due-soon alerts |
| `--color-danger` | `#ef4444` | Overdue · errors |
| `--radius-sm/md/lg/xl/full` | `6/12/20/32/9999px` | Border radius scale |
| `--font-sans` | `"Montserrat", ui-sans-serif` | All UI text |

---

## Typography Scale

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display / stat values | 28–36px | 800 | Letter-spacing −1px |
| Page title (h1) | 22–24px | 700 | |
| Section heading (h2) | 17–18px | 700 | |
| Body | 14px | 400 | |
| Form label | 13px | 600 | |
| Caption / meta | 11px | 500 | |
| Overline | 10px | 700 | Uppercase · +2.5px tracking |

---

## Component Patterns (reference only — already implemented)

### Button
- Primary: `bg-steel text-white hover:bg-steel/90 active:scale-[0.98]`
- Secondary: `bg-cream text-slate border border-slate/20`
- Ghost: `bg-transparent text-steel hover:bg-steel/10`
- Danger: `bg-red-500 text-white`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-steel`
- Sizes: sm `px-3 py-1.5 text-xs rounded-lg` · md `px-4 py-2.5 text-sm rounded-xl` · lg `px-6 py-3 text-base rounded-xl`

### Card
- Default: `bg-white border border-slate/10 shadow-sm hover:shadow-md rounded-2xl`
- Glass: `glass-card text-white` (see `.glass-card` utility in globals.css)
- Dark: `bg-slate text-cream border border-white/10`

### StatusChip (loan states)
- Active: `bg-steel/10 text-steel` + `bg-steel` dot
- Returned: `bg-green-50 text-green-700` + `bg-green-500` dot
- Overdue: `bg-red-50 text-red-700` + `bg-red-500` dot
- Lost: `bg-slate/10 text-slate/60` + `bg-slate/40` dot

### Input
- Base: `rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm`
- Focus: `focus:ring-2 focus:ring-steel focus:border-transparent`
- Error: `border-red-400`

---

## OrbitLogo Component API (already implemented — reference only)

```tsx
import OrbitLogo, { OrbitMark } from '@/components/ui/OrbitLogo';

// Mark only (sidebar collapsed, favicons, etc.)
<OrbitMark width={40} />

// Full lockup — dark background
<OrbitLogo markWidth={52} variant="dark" layout="inline" />

// Full lockup — light background
<OrbitLogo markWidth={52} variant="light" layout="inline" />

// Mark only, no wordmark (login page hero)
<OrbitLogo markWidth={80} showWordmark={false} />

// Stacked layout
<OrbitLogo markWidth={56} layout="stacked" variant="dark" />
```

**Wordmark text is always:** `Orbit` (large, 800) + `Library Management System` (small caps, spaced)

---

## Assets in this Package

| File | Description |
|---|---|
| `Orbit Brand Guide.html` | Full brand guide — open in browser |
| `Orbit Logo.html` | Logo exploration with all variants |
| `README.md` | This file |

---

## Checklist

- [ ] `DashboardShell.tsx` — replace Rocket icon with `<OrbitMark width={28} />`  
- [ ] `public/favicon.svg` — replace with bookshelf favicon SVG  
- [ ] `public/icons/icon.svg` — replace with 512px bookshelf SVG  
- [ ] `public/icons/icon-192.png` — rasterise from new SVG  
- [ ] `public/icons/icon-512.png` — rasterise from new SVG  
- [ ] `public/icons/apple-touch-icon.png` — rasterise at 180×180  
- [ ] `public/favicon.png` — rasterise at 32×32  
- [ ] Verify no remaining `<Rocket>` imports in UI components  
- [ ] Verify all Tailwind classes reference brand tokens (`steel`, `golden`, `lavender`, `cream`, `slate`) not raw hex  

---

*Orbit Library Management System · Brand Guidelines v1.0 · April 2026*  
*Tshiamiso Astronauts · tshiamisoastronauts.org*
