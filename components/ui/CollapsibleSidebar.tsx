'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SquaresFour,
  BookOpen,
  ArrowsLeftRight,
  UsersThree,
  FileText,
  Gear,
  CaretLeft,
  CaretRight,
  GraduationCap,
  ArrowSquareOut,
  SignOut,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import OrbitLogo, { OrbitMark } from '@/components/ui/OrbitLogo';

const navItems = [
  { href: '/',                label: 'Mission Control', icon: SquaresFour },
  { href: '/catalogue',       label: 'Catalogue',        icon: BookOpen },
  { href: '/loans',           label: 'Loans',            icon: ArrowsLeftRight },
  { href: '/learners',        label: 'Learners',         icon: UsersThree },
  { href: '/reports',         label: 'Reports',          icon: FileText },
  { href: '/settings',        label: 'Settings',         icon: Gear },
];

export default function CollapsibleSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      className={[
        'flex flex-col bg-slate text-cream shrink-0',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
      style={{ transition: 'width 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        {collapsed ? (
          <OrbitMark width={32} dark={true} />
        ) : (
          <OrbitLogo markWidth={40} variant="dark" />
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-2',
                isActive
                  ? 'sidebar-nav-active'
                  : 'text-cream/70 hover:bg-white/10 hover:text-cream border-l-transparent',
              ].join(' ')}
            >
              <Icon weight="light" className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Learner portal link */}
      <div className="px-2 pb-3 border-t border-white/10 pt-3">
        <a
          href="/learner/login"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'Learner Portal' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-lavender/70 hover:bg-white/10 hover:text-lavender transition-colors"
        >
          <GraduationCap weight="light" className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="truncate flex items-center gap-1.5">
              Learner Portal
              <ArrowSquareOut weight="light" className="w-3 h-3 opacity-60" />
            </span>
          )}
        </a>
      </div>

      {/* Sign out */}
      <div className="px-2 pb-2">
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/50 hover:bg-white/10 hover:text-red-400 transition-colors"
        >
          <SignOut weight="light" className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-white/10 text-cream/50 hover:text-cream transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <CaretRight weight="light" className="w-4 h-4" />
        ) : (
          <CaretLeft weight="light" className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
