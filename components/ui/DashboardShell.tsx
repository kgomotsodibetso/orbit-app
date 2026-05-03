'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import CollapsibleSidebar from './CollapsibleSidebar';
import { OrbitMark } from '@/components/ui/OrbitLogo';

/** Thin progress bar at the top — shows immediately on any link click,
 *  disappears once the new pathname lands. Gives instant click feedback
 *  so users don't double-click thinking nothing happened. */
function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);

  // Start bar on any anchor/button click that might trigger navigation
  useEffect(() => {
    const start = () => {
      setVisible(true);
      setWidth(30);
      timerRef.current = setTimeout(() => setWidth(70), 200);
    };
    document.addEventListener('click', start, { capture: true, passive: true });
    return () => document.removeEventListener('click', start, { capture: true });
  }, []);

  // Finish bar when pathname changes (navigation completed)
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

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

      {/* Sidebar — hidden on mobile unless open, always visible on md+ */}
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

        {/* Mobile top bar — only shown on < md */}
        <header className="flex items-center gap-3 px-4 py-3 bg-slate border-b border-white/10 md:hidden shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-cream/60 hover:text-cream hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <OrbitMark width={28} dark={true} />
            <span className="font-bold text-sm text-cream tracking-wide">Orbit</span>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
