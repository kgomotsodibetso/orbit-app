'use client';

import { useState } from 'react';
import { User, Building2, Bell, Palette, CreditCard, Shield } from 'lucide-react';
import type { InstitutionRow, ProfileRow } from '@/types/database';
import InstitutionForm from './InstitutionForm';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  institution: InstitutionRow | null;
  profile: ProfileRow | null;
  userEmail: string | null;
  bookCount: number;
  memberCount: number;
  tierInfo: { label: string; colour: string };
}

// ── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: 'rgba(75,142,186,0.18)',  fg: '#2E6A90' },
  { bg: 'rgba(162,159,236,0.18)', fg: '#4845a0' },
  { bg: 'rgba(246,185,59,0.18)',  fg: '#92680a' },
  { bg: 'rgba(34,197,94,0.18)',   fg: '#15803d' },
  { bg: 'rgba(44,58,71,0.14)',    fg: '#2C3A47' },
];

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

function avatarColors(name: string | null) {
  if (!name) return AVATAR_PALETTE[0];
  return AVATAR_PALETTE[(name.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 rounded-full"
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        background: value
          ? 'linear-gradient(135deg, #C4C0FB, #4B8EBA)'
          : 'rgba(44,58,71,0.18)',
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: value ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.15s',
        }}
      />
    </button>
  );
}

// ── NotifRow ──────────────────────────────────────────────────────────────────

function NotifRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate/6 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate">{label}</p>
        <p className="text-xs text-slate/50 mt-0.5">{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── SettingsTabs ──────────────────────────────────────────────────────────────

export default function SettingsTabs({
  institution,
  profile,
  userEmail,
  bookCount,
  memberCount,
  tierInfo,
}: Props) {
  const TABS = [
    { id: 'profile',       label: 'Profile',       Icon: User },
    { id: 'school',        label: 'School',        Icon: Building2 },
    { id: 'notifications', label: 'Notifications', Icon: Bell },
    { id: 'appearance',    label: 'Appearance',    Icon: Palette },
  ] as const;

  type TabId = (typeof TABS)[number]['id'];
  const [tab, setTab] = useState<TabId>('profile');

  // ── Notifications state ──────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    smsOverdue:    true,
    smsReminder:   true,
    emailSummary:  true,
    emailNew:      false,
    overdueReport: true,
    newBookAlert:  false,
    lowStockAlert: false,
    returnConfirm: true,
  });
  const setNotif = (k: keyof typeof notifs, v: boolean) =>
    setNotifs((n) => ({ ...n, [k]: v }));

  // ── Appearance state ─────────────────────────────────────────────────────
  const [accentColor, setAccentColor] = useState('steel');
  const [dateFormat,  setDateFormat]  = useState('dd/mm/yyyy');
  const [density,     setDensity]     = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');

  const ACCENT_SWATCHES = [
    { k: 'steel',    c: '#4B8EBA', l: 'Steel'    },
    { k: 'slate',    c: '#2C3A47', l: 'Slate'    },
    { k: 'golden',   c: '#F6B93B', l: 'Golden'   },
    { k: 'lavender', c: '#A29FEC', l: 'Lavender' },
    { k: 'green',    c: '#22c55e', l: 'Green'    },
    { k: 'red',      c: '#ef4444', l: 'Red'      },
  ] as const;

  const av      = avatarColors(profile?.full_name ?? null);
  const initial = initials(profile?.full_name ?? null);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-slate/10 p-1 w-fit max-w-full overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
              tab === id
                ? 'bg-slate text-cream'
                : 'text-slate/55 hover:text-slate hover:bg-slate/5',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {tab === 'profile' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-slate/10 p-6 flex flex-col items-center gap-4 text-center mb-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-md"
              style={{ background: av.bg, color: av.fg }}
            >
              {initial}
            </div>
            <div>
              <p className="text-lg font-black text-slate">{profile?.full_name ?? '—'}</p>
              <p className="text-sm text-slate/50 mt-0.5 capitalize">{profile?.role ?? '—'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Email',   value: userEmail ?? profile?.email ?? '—' },
                { label: 'Phone',   value: profile?.phone ?? '—' },
                { label: 'Role',    value: profile?.role  ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate/5 border border-slate/10 mt-4">
            <Shield className="w-4 h-4 text-slate/30 mt-0.5 shrink-0" />
            <p className="text-xs text-slate/40 leading-relaxed">
              To change your password or email address, use the{' '}
              <a href="/forgot-password" className="text-steel font-semibold hover:underline">
                password reset flow
              </a>
              . All data is stored in South Africa and protected under POPIA.
            </p>
          </div>
        </div>
      )}

      {/* ── SCHOOL ── */}
      {tab === 'school' && (
        <div className="max-w-2xl space-y-6">
          {/* Institution form */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate/40" />
              <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Institution Profile</h2>
            </div>
            {institution ? (
              <InstitutionForm institution={institution} />
            ) : (
              <div className="bg-white rounded-2xl border border-slate/10 p-6 text-center text-sm text-slate/40">
                Institution record not found.
              </div>
            )}
          </section>

          {/* Subscription */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-slate/40" />
              <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Subscription</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate">Plan</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierInfo.colour}`}>
                  {tierInfo.label}
                </span>
              </div>

              {institution?.subscription_ends_at && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate/60">Renews</p>
                  <p className="text-sm font-medium text-slate">
                    {new Date(institution.subscription_ends_at).toLocaleDateString('en-ZA')}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate/60">Status</p>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                    institution?.subscription_status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {institution?.subscription_status ?? '—'}
                </span>
              </div>

              <div className="border-t border-slate/10 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate/40 mb-1">Books used</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-xl font-bold text-slate">{bookCount}</span>
                    <span className="text-sm text-slate/40 mb-0.5">/ {institution?.max_books ?? '—'}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-steel transition-all"
                      style={{
                        width: institution?.max_books
                          ? `${Math.min(100, (bookCount / institution.max_books) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate/40 mb-1">Members used</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-xl font-bold text-slate">{memberCount}</span>
                    <span className="text-sm text-slate/40 mb-0.5">/ {institution?.max_members ?? '—'}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-lavender transition-all"
                      style={{
                        width: institution?.max_members
                          ? `${Math.min(100, (memberCount / institution.max_members) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate/10 p-6 max-w-lg">
          <h2 className="text-sm font-bold text-slate mb-1">Notification Preferences</h2>
          <p className="text-xs text-slate/50 mb-5">Choose when and how you receive alerts</p>

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1">SMS Alerts</p>
          <NotifRow key="smsOverdue"  label="Overdue SMS to Learners"  desc="Automatically SMS learners with overdue books each night"  value={notifs.smsOverdue}    onChange={(v) => setNotif('smsOverdue', v)} />
          <NotifRow key="smsReminder" label="Due Date Reminder SMS"    desc="Remind learners 2 days before their book is due"          value={notifs.smsReminder}   onChange={(v) => setNotif('smsReminder', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Email Reports</p>
          <NotifRow key="emailSummary"  label="Weekly Summary Email"    desc="Receive a library report every Monday morning"         value={notifs.emailSummary}  onChange={(v) => setNotif('emailSummary', v)} />
          <NotifRow key="emailNew"      label="New Registration Alerts" desc="Email when a new learner registers on the portal"      value={notifs.emailNew}      onChange={(v) => setNotif('emailNew', v)} />
          <NotifRow key="overdueReport" label="Monthly Overdue Report"  desc="Full overdue report on the 1st of each month"         value={notifs.overdueReport} onChange={(v) => setNotif('overdueReport', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Library Activity</p>
          <NotifRow key="newBookAlert"   label="New Book Added"       desc="Notify staff when a new book is catalogued"             value={notifs.newBookAlert}   onChange={(v) => setNotif('newBookAlert', v)} />
          <NotifRow key="lowStockAlert"  label="Low Stock Warnings"   desc="Alert when any book has 0 copies available"            value={notifs.lowStockAlert}  onChange={(v) => setNotif('lowStockAlert', v)} />
          <NotifRow key="returnConfirm"  label="Return Confirmations" desc="Send confirmation to learner when book is marked returned" value={notifs.returnConfirm} onChange={(v) => setNotif('returnConfirm', v)} />
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <div className="bg-white rounded-2xl border border-slate/10 p-6 max-w-md space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate mb-1">Display Preferences</h2>
            <p className="text-xs text-slate/50">Choose the highlight colour used across the interface</p>
          </div>

          {/* Accent colour */}
          <div>
            <p className="text-sm font-semibold text-slate mb-3">Accent Colour</p>
            <div className="flex gap-2.5 flex-wrap">
              {ACCENT_SWATCHES.map(({ k, c, l }) => (
                <button
                  key={k}
                  type="button"
                  title={l}
                  onClick={() => setAccentColor(k)}
                  className="relative w-9 h-9 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-steel"
                  style={{
                    background: c,
                    border: accentColor === k ? '3px solid #2C3A47' : '2px solid rgba(44,58,71,0.1)',
                    cursor: 'pointer',
                  }}
                >
                  {accentColor === k && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date format */}
          <div>
            <label className="text-sm font-semibold text-slate block mb-1.5">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel cursor-pointer"
              style={{ fontFamily: 'inherit' }}
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY (22/04/2026)</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY (04/22/2026)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (2026-04-22)</option>
              <option value="long">Long (22 April 2026)</option>
            </select>
          </div>

          {/* Density */}
          <div>
            <p className="text-sm font-semibold text-slate mb-2">Interface Density</p>
            <div className="flex gap-2">
              {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className={[
                    'px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer',
                    density === d
                      ? 'bg-slate text-cream'
                      : 'bg-white text-slate/60 border border-slate/15 hover:border-slate/30',
                  ].join(' ')}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
