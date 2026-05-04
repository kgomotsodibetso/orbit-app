'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import CollapsibleSidebar from './CollapsibleSidebar';
import { OrbitMark } from '@/components/ui/OrbitLogo';

type Density = 'compact' | 'comfortable' | 'spacious';

const densityPadding: Record<Density, string> = {
  compact:     'p-3 sm:p-4 md:p-5',
  comfortable: 'p-4 sm:p-6 md:p-8',
  spacious:    'p-6 sm:p-8 md:p-12',
};

function readLocalPref<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const v = localStorage.getItem(key);
  return (v !== null ? v : fallback) as T;
}

/** Thin progress bar at the top. Fires on any click, completes when pathname changes. */
function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    const start = () => {
      setVisible(true);
      setWidth(30);
      timerRef.current = setTimeout(() => setWidth(70), 200);
    };
    document.addEventListener('click', start, { capture: true, passive: true });
    return () => document.removeEventListener('click', start, { capture: true });
  }, []);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      if (timerRef.current) clearTimeout(timerRef.current);
      setWidth(100);
      const hide = setTimeout(() => { setVisible(false); setWidth(0); }, 300);
      return () => clearTimeout(hide);
    }
  }, [pathname]);

  if (!visible) return null;
  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-gradient-to-r from-lavender to-steel transition-[width] duration-300 ease-out pointer-events-none"
      style={{ width: `${width}%` }}
    />
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Read display preferences from localStorage (written by Settings > Appearance)
  const [density,     setDensity]     = useState<Density>('comfortable');
  const [darkSidebar, setDarkSidebar] = useState(true);

  useEffect(() => {
    setDensity((readLocalPref('orbit_density', 'comfortable')) as Density);
    setDarkSidebar(readLocalPref<string>('orbit_dark_sidebar', 'true') !== 'false');
  }, []);

  // Live-update when user saves preferences without reloading
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { density?: Density; darkSidebar?: boolean };
      if (detail.density)     setDensity(detail.density);
      if (detail.darkSidebar !== undefined) setDarkSidebar(detail.darkSidebar);
    };
    window.addEventListener('orbit-prefs-changed', handler);
    return () => window.removeEventListener('orbit-prefs-changed', handler);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <NavProgress />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 md:relative md:flex md:z-auto transition-transform duration-300',
          mobileOpen ? 'flex' : 'hidden md:flex',
        ].join(' ')}
      >
        <CollapsibleSidebar />
      </div>

      {/* Right side: mobile top bar + main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <header className={`flex items-center gap-3 px-4 py-3 border-b md:hidden shrink-0 ${darkSidebar ? 'bg-slate border-white/10' : 'bg-white border-slate/10'}`}>
          <button
            onClick={() => setMobileOpen(true)}
            className={`p-1.5 rounded-lg transition-colors ${darkSidebar ? 'text-cream/60 hover:text-cream hover:bg-white/10' : 'text-slate/60 hover:text-slate hover:bg-slate/5'}`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <OrbitMark width={28} dark={darkSidebar} />
            <span className={`font-bold text-sm tracking-wide ${darkSidebar ? 'text-cream' : 'text-slate'}`}>Orbit</span>
          </div>
        </header>

        {/* Page content — padding controlled by density preference */}
        <main id="main-content" className={`flex-1 overflow-y-auto ${densityPadding[density]}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
