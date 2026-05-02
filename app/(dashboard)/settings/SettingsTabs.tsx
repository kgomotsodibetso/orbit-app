'use client';

import { useRef, useState } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { OrbitMark } from '@/components/ui/OrbitLogo';
import type { InstitutionRow, ProfileRow } from '@/types/database';

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

const AVATAR_COLORS = [
  { bg: '#4B8EBA', fg: 'white',    name: 'Steel'    },
  { bg: '#2C3A47', fg: '#F0E5DF',  name: 'Slate'    },
  { bg: '#F6B93B', fg: '#2C3A47',  name: 'Golden'   },
  { bg: '#A29FEC', fg: 'white',    name: 'Lavender' },
  { bg: '#22c55e', fg: 'white',    name: 'Green'    },
  { bg: '#ef4444', fg: 'white',    name: 'Red'      },
  { bg: '#8B5CF6', fg: 'white',    name: 'Purple'   },
  { bg: '#F0E5DF', fg: '#2C3A47',  name: 'Cream'    },
];

type AvatarColor = (typeof AVATAR_COLORS)[number];

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

// ── AvatarPicker ──────────────────────────────────────────────────────────────

function AvatarPicker({
  initials,
  color,
  setColor,
}: {
  initials: string;
  color: AvatarColor;
  setColor: (c: AvatarColor) => void;
}) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: color.fg, border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {initials}
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#2C3A47', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', border: '2px solid white' }}>✎</div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="secondary" onClick={() => setOpen(o => !o)}>Change Colour</Button>
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>Upload Photo</Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => {}} />
      </div>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: 14, background: 'white', borderRadius: 16, border: '1px solid rgba(44,58,71,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: 280 }}>
          {AVATAR_COLORS.map(c => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => { setColor(c); setOpen(false); }}
              style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', background: c.bg, border: color.name === c.name ? '3px solid #2C3A47' : '2px solid rgba(44,58,71,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: c.fg }}
            >
              {initials}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 rounded-full"
      style={{ width: 44, height: 24, border: 'none', cursor: 'pointer', padding: 2, background: value ? 'linear-gradient(135deg,#C4C0FB,#4B8EBA)' : 'rgba(44,58,71,0.18)', transition: 'background 0.15s' }}
    >
      <span style={{ display: 'block', width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: value ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.15s' }} />
    </button>
  );
}

// ── NotifRow ──────────────────────────────────────────────────────────────────

function NotifRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate/6 last:border-b-0">
      <div>
        <p className="text-sm font-bold text-slate">{label}</p>
        <p className="text-xs text-slate/50 mt-0.5">{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────

function AvatarCircle({ name, size = 40 }: { name: string; size?: number }) {
  const ini = name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  const palettes = ['#4B8EBA20,#4B8EBA', '#F6B93B20,#92680a', '#A29FEC20,#4845a0', '#22c55e20,#15803d', '#ef444420,#b91c1c'];
  const [bg, fg] = palettes[(name.charCodeAt(0) ?? 0) % palettes.length].split(',');
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>
      {ini}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,40,48,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate/10 shrink-0">
          <h2 className="text-base font-bold text-slate">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate/40 hover:text-slate hover:bg-slate/8 transition-colors text-xl border-0 bg-transparent cursor-pointer">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Toast helper ──────────────────────────────────────────────────────────────

function useSimpleToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };
  const el = msg ? (
    <div className="fixed bottom-20 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl pointer-events-none" style={{ animation: 'slideUp 0.18s ease' }}>
      ✓ {msg}
    </div>
  ) : null;
  return { show, el };
}

// ── SettingsTabs ──────────────────────────────────────────────────────────────

export default function SettingsTabs({ institution, profile, userEmail, bookCount, memberCount, tierInfo }: Props) {
  const toast = useSimpleToast();

  const TABS = [
    { id: 'profile',       label: 'Profile',       icon: '👤' },
    { id: 'school',        label: 'School',         icon: '🏫' },
    { id: 'notifications', label: 'Notifications',  icon: '🔔' },
    { id: 'appearance',    label: 'Appearance',     icon: '🎨' },
    { id: 'team',          label: 'Team',           icon: '👥' },
  ] as const;

  type TabId = (typeof TABS)[number]['id'];
  const [tab, setTab] = useState<TabId>('profile');

  // ── Profile state ────────────────────────────────────────────────────────
  const nameParts = (profile?.full_name ?? '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') ?? '');
  const [role,      setRole]      = useState(profile?.role ?? '');
  const [email,     setEmail]     = useState(userEmail ?? profile?.email ?? '');
  const [phone,     setPhone]     = useState(profile?.phone ?? '');
  const [bio,       setBio]       = useState('Passionate about reading and connecting learners with books.');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(AVATAR_COLORS[0]);
  const initials = getInitials((`${firstName} ${lastName}`.trim()) || (profile?.full_name ?? '?'));

  // ── School state ─────────────────────────────────────────────────────────
  const [schoolName,    setSchoolName]    = useState(institution?.name ?? '');
  const [contactEmail,  setContactEmail]  = useState(institution?.contact_email ?? '');
  const [contactPhone,  setContactPhone]  = useState(institution?.contact_phone ?? '');
  const [loanDays,      setLoanDays]      = useState('14');
  const [maxBooks,      setMaxBooks]      = useState('3');
  const [finePerDay,    setFinePerDay]    = useState('0');
  const [openTime,      setOpenTime]      = useState('07:30');
  const [closeTime,     setCloseTime]     = useState('15:30');
  const [schoolSaving,  setSchoolSaving]  = useState(false);
  const [schoolSaved,   setSchoolSaved]   = useState(false);
  const [schoolError,   setSchoolError]   = useState('');

  const handleSchoolSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSaving(true); setSchoolError('');
    const res = await fetch('/api/settings/institution', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: schoolName.trim(), contact_email: contactEmail.trim(), contact_phone: contactPhone.trim() || null }),
    });
    const data = await res.json();
    setSchoolSaving(false);
    if (!res.ok) { setSchoolError(data.error ?? 'Failed to save'); }
    else { setSchoolSaved(true); toast.show('School settings saved'); setTimeout(() => setSchoolSaved(false), 3000); }
  };

  // ── Notifications state ──────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({ smsOverdue: true, smsReminder: true, emailSummary: true, emailNew: false, overdueReport: true, newBookAlert: false, lowStockAlert: false, returnConfirm: true });
  const setNotif = (k: keyof typeof notifs, v: boolean) => { setNotifs(n => ({ ...n, [k]: v })); toast.show(v ? 'Enabled' : 'Disabled'); };

  // ── Appearance state ─────────────────────────────────────────────────────
  const [accentColor,  setAccentColor]  = useState('steel');
  const [dateFormat,   setDateFormat]   = useState('dd/mm/yyyy');
  const [density,      setDensity]      = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [darkSidebar,  setDarkSidebar]  = useState(true);

  // ── Team state ───────────────────────────────────────────────────────────
  const [team, setTeam] = useState([
    { id: 't1', name: 'Naledi Dube',   role: 'Head Librarian', email: 'naledi.dube@tshiamiso.edu.za', status: 'active',  last: 'Today'     },
    { id: 't2', name: 'Sipho Khumalo', role: 'Librarian',      email: 'sipho.k@tshiamiso.edu.za',     status: 'active',  last: 'Yesterday' },
    { id: 't3', name: 'Amara Osei',    role: 'Volunteer',      email: 'amara.o@tshiamiso.edu.za',      status: 'pending', last: 'Never'     },
  ]);
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole,  setInviteRole]  = useState('Librarian');

  const ACCENT_SWATCHES = [
    { k: 'steel', c: '#4B8EBA', l: 'Steel' }, { k: 'slate', c: '#2C3A47', l: 'Slate' },
    { k: 'golden', c: '#F6B93B', l: 'Golden' }, { k: 'lavender', c: '#A29FEC', l: 'Lavender' },
    { k: 'green', c: '#22c55e', l: 'Green' }, { k: 'red', c: '#ef4444', l: 'Red' },
  ] as const;

  return (
    <div style={{ paddingBottom: 24 }}>
      {toast.el}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 14, border: '1px solid rgba(44,58,71,0.1)', padding: 4, overflowX: 'auto', width: 'fit-content', maxWidth: '100%' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] text-xs font-bold transition-all border-0 cursor-pointer"
            style={{ padding: '8px 14px', background: tab === t.id ? '#2C3A47' : 'transparent', color: tab === t.id ? '#F0E5DF' : 'rgba(44,58,71,0.55)', fontFamily: 'inherit' }}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ════ PROFILE ════ */}
      {tab === 'profile' && (
        <div className="flex flex-col md:flex-row gap-5 items-start" style={{ maxWidth: 760 }}>
          {/* Avatar card */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 220, flexShrink: 0 }}>
            <AvatarPicker initials={initials} color={avatarColor} setColor={setAvatarColor} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: '#2C3A47' }}>{firstName} {lastName}</p>
              <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2, textTransform: 'capitalize' }}>{role || profile?.role}</p>
              <div style={{ marginTop: 8 }}><Badge variant="golden">Administrator</Badge></div>
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(44,58,71,0.07)', margin: '16px 0' }} />
            <div style={{ width: '100%', fontSize: 12, color: 'rgba(44,58,71,0.5)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✉</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>📞</span><span>{phone || '—'}</span></div>
            </div>
          </div>

          {/* Profile form */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#2C3A47', marginBottom: 18 }}>Personal Information</h2>
            <form onSubmit={e => { e.preventDefault(); toast.show('Profile saved'); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <Input label="Last Name"  value={lastName}  onChange={e => setLastName(e.target.value)}  required />
              </div>
              <Input label="Job Title / Role" value={role || profile?.role || ''} onChange={e => setRole(e.target.value)} placeholder="Head Librarian" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Phone Number"  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 200))}
                  placeholder="Tell us about yourself…"
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-xl border border-slate/20 px-4 py-2.5 text-sm text-slate resize-y focus:outline-none focus:ring-2 focus:ring-steel focus:border-transparent"
                  style={{ fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.4)', textAlign: 'right' }}>{bio.length}/200</p>
              </div>

              {/* Change Password */}
              <div style={{ borderTop: '1px solid rgba(44,58,71,0.07)', paddingTop: 16, marginTop: 4 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', marginBottom: 14 }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="New Password"     type="password" placeholder="Min. 8 characters" />
                    <Input label="Confirm Password" type="password" placeholder="Repeat new password" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
                <Button type="submit">Save Profile</Button>
                <Button variant="secondary" type="button" onClick={() => toast.show('Password updated')}>Update Password</Button>
                <Button variant="danger"    type="button" onClick={() => toast.show('Signed out')}>Sign Out</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ SCHOOL ════ */}
      {tab === 'school' && (
        <div style={{ maxWidth: 620 }}>
          {/* School logo card */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: '#2C3A47', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <OrbitMark width={44} dark={true} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#2C3A47' }}>{institution?.name ?? '—'}</p>
              <p style={{ fontSize: 13, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>
                {institution?.province}{institution?.province && ' · '}{institution?.type} School
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button size="sm" variant="secondary" onClick={() => toast.show('Logo upload coming soon')}>Upload Logo</Button>
                <Button size="sm" variant="ghost">Remove</Button>
              </div>
            </div>
          </div>

          {/* School details form */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24 }}>
            <form onSubmit={handleSchoolSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47' }}>School Details</h2>

              <Input label="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} required />

              {/* Read-only province + type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Province</p>
                  <p className="text-sm font-medium text-slate">{institution?.province ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">School Type</p>
                  <p className="text-sm font-medium text-slate capitalize">{institution?.type ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Admin Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                <Input label="Phone"       type="tel"   value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              </div>

              {/* Library rules */}
              <div style={{ borderTop: '1px solid rgba(44,58,71,0.07)', paddingTop: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', marginBottom: 14 }}>Library Rules</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Loan Period (days)"    type="number" value={loanDays}   onChange={e => setLoanDays(e.target.value)} />
                  <Input label="Max Books Per Learner" type="number" value={maxBooks}   onChange={e => setMaxBooks(e.target.value)} />
                  <Input label="Fine Per Day (R)"      type="number" value={finePerDay} onChange={e => setFinePerDay(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input label="Library Opens"  type="time" value={openTime}  onChange={e => setOpenTime(e.target.value)} />
                  <Input label="Library Closes" type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                </div>
              </div>

              {schoolError && <p className="text-sm text-red-600">{schoolError}</p>}

              <div className="flex items-center justify-between pt-1">
                {schoolSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button type="submit" loading={schoolSaving} className={schoolSaved ? '' : 'ml-auto'}>Save School Settings</Button>
              </div>
            </form>
          </div>

          {/* Subscription */}
          <div style={{ marginTop: 16 }}>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">Subscription</p>
            <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate">Plan</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierInfo.colour}`}>{tierInfo.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate/60">Status</p>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${institution?.subscription_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
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
                    <div className="h-full rounded-full bg-steel transition-all" style={{ width: institution?.max_books ? `${Math.min(100, (bookCount / institution.max_books) * 100)}%` : '0%' }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate/40 mb-1">Members used</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-xl font-bold text-slate">{memberCount}</span>
                    <span className="text-sm text-slate/40 mb-0.5">/ {institution?.max_members ?? '—'}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate/10 overflow-hidden">
                    <div className="h-full rounded-full bg-lavender transition-all" style={{ width: institution?.max_members ? `${Math.min(100, (memberCount / institution.max_members) * 100)}%` : '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ NOTIFICATIONS ════ */}
      {tab === 'notifications' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, maxWidth: 560 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47', marginBottom: 4 }}>Notification Preferences</h2>
          <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginBottom: 18 }}>Choose when and how you receive alerts</p>

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1">SMS Alerts</p>
          <NotifRow label="Overdue SMS to Learners"  desc="Automatically SMS learners with overdue books each night" value={notifs.smsOverdue}    onChange={v => setNotif('smsOverdue', v)} />
          <NotifRow label="Due Date Reminder SMS"    desc="Remind learners 2 days before their book is due"         value={notifs.smsReminder}   onChange={v => setNotif('smsReminder', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Email Reports</p>
          <NotifRow label="Weekly Summary Email"    desc="Receive a library report every Monday morning"        value={notifs.emailSummary}  onChange={v => setNotif('emailSummary', v)} />
          <NotifRow label="New Registration Alerts" desc="Email when a new learner registers on the portal"     value={notifs.emailNew}      onChange={v => setNotif('emailNew', v)} />
          <NotifRow label="Monthly Overdue Report"  desc="Full overdue report on the 1st of each month"        value={notifs.overdueReport} onChange={v => setNotif('overdueReport', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Library Activity</p>
          <NotifRow label="New Book Added"       desc="Notify staff when a new book is catalogued"               value={notifs.newBookAlert}  onChange={v => setNotif('newBookAlert', v)} />
          <NotifRow label="Low Stock Warnings"   desc="Alert when any book has 0 copies available"              value={notifs.lowStockAlert} onChange={v => setNotif('lowStockAlert', v)} />
          <NotifRow label="Return Confirmations" desc="Send confirmation to learner when book is marked returned" value={notifs.returnConfirm} onChange={v => setNotif('returnConfirm', v)} />
        </div>
      )}

      {/* ════ APPEARANCE ════ */}
      {tab === 'appearance' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, maxWidth: 520 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47', marginBottom: 18 }}>Display Preferences</h2>

          {/* Accent colour */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47', marginBottom: 4 }}>Accent Colour</p>
            <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginBottom: 10 }}>Choose the highlight colour used across the interface</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACCENT_SWATCHES.map(ac => (
                <button key={ac.k} type="button" title={ac.l}
                  onClick={() => { setAccentColor(ac.k); toast.show(`Accent changed to ${ac.l}`); }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: ac.c, border: accentColor === ac.k ? '3px solid #2C3A47' : '2px solid rgba(44,58,71,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.12s' }}>
                  {accentColor === ac.k && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Date format */}
          <div style={{ marginBottom: 18 }}>
            <label className="text-sm font-semibold text-slate block mb-1.5">Date Format</label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel cursor-pointer" style={{ fontFamily: 'inherit' }}>
              <option value="dd/mm/yyyy">DD/MM/YYYY (22/04/2026)</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY (04/22/2026)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (2026-04-22)</option>
              <option value="long">Long (22 April 2026)</option>
            </select>
          </div>

          {/* Density */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47', marginBottom: 8 }}>Interface Density</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['compact', 'comfortable', 'spacious'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDensity(d)}
                  style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${density === d ? '#2C3A47' : 'rgba(44,58,71,0.15)'}`, background: density === d ? '#2C3A47' : 'white', color: density === d ? '#F0E5DF' : 'rgba(44,58,71,0.6)', textTransform: 'capitalize', transition: 'all 0.1s' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Dark sidebar toggle */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(44,58,71,0.07)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>Dark Sidebar</p>
              <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>Use the dark colour scheme for the navigation sidebar</p>
            </div>
            <Toggle value={darkSidebar} onChange={v => { setDarkSidebar(v); toast.show(v ? 'Enabled' : 'Disabled'); }} />
          </div>

          <div style={{ paddingTop: 12 }}>
            <Button onClick={() => toast.show('Appearance saved')}>Save Preferences</Button>
          </div>
        </div>
      )}

      {/* ════ TEAM ════ */}
      {tab === 'team' && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(44,58,71,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47' }}>Staff Members</p>
                <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 1 }}>{team.length} team members</p>
              </div>
              <Button size="sm" onClick={() => setShowInvite(true)}>+ Invite Staff</Button>
            </div>
            {team.map((member, i) => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < team.length - 1 ? '1px solid rgba(44,58,71,0.06)' : 'none' }}>
                <AvatarCircle name={member.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>{member.name}</p>
                    <Badge variant={member.status === 'active' ? 'steel' : 'warning'}>{member.status === 'active' ? 'Active' : 'Pending'}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 1 }}>{member.role} · {member.email}</p>
                  <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.35)', marginTop: 1 }}>Last active: {member.last}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {member.status === 'pending' && (
                    <Button size="sm" variant="secondary" onClick={() => { setTeam(t => t.map(m => m.id === member.id ? { ...m, status: 'active', last: 'Just now' } : m)); toast.show(`${member.name} approved`); }}>Approve</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setTeam(t => t.filter(m => m.id !== member.id)); toast.show(`${member.name} removed`); }}>Remove</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Role permissions */}
          <div style={{ background: 'rgba(75,142,186,0.06)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(75,142,186,0.15)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#4B8EBA', marginBottom: 10 }}>Role Permissions</p>
            {[
              { role: 'Administrator',  perms: 'Full access — settings, team, reports, all data',             v: 'golden'  },
              { role: 'Head Librarian', perms: 'All library functions — add books, manage loans, view reports', v: 'steel'   },
              { role: 'Librarian',      perms: 'Check in/out, manage catalogue, view learners',               v: 'neutral' },
              { role: 'Volunteer',      perms: 'Check in/out books only',                                      v: 'neutral' },
            ].map(r => (
              <div key={r.role} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
                <Badge variant={r.v as 'golden' | 'steel' | 'neutral'}>{r.role}</Badge>
                <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.6)' }}>{r.perms}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Staff Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Email Address" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@school.co.za" required />
          <div>
            <label className="text-sm font-semibold text-slate block mb-1.5">Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel cursor-pointer" style={{ fontFamily: 'inherit' }}>
              {['Librarian', 'Head Librarian', 'Volunteer'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ background: 'rgba(240,229,223,0.6)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'rgba(44,58,71,0.65)' }}>
            An invitation email will be sent to the address above.
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button
              disabled={!inviteEmail}
              onClick={() => {
                setTeam(t => [...t, { id: `t${Date.now()}`, name: inviteEmail.split('@')[0], role: inviteRole, email: inviteEmail, status: 'pending', last: 'Never' }]);
                toast.show(`Invite sent to ${inviteEmail}`);
                setShowInvite(false);
                setInviteEmail('');
              }}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* POPIA note (profile tab only) */}
      {tab === 'profile' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate/5 border border-slate/10 mt-4" style={{ maxWidth: 760 }}>
          <Shield className="w-4 h-4 text-slate/30 mt-0.5 shrink-0" />
          <p className="text-xs text-slate/40 leading-relaxed">
            To change your email address, use the{' '}
            <a href="/forgot-password" className="text-steel font-semibold hover:underline">password reset flow</a>.
            All data is stored in South Africa and protected under POPIA.
          </p>
        </div>
      )}
    </div>
  );
}
