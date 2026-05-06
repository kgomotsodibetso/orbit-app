'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle, Eye, EyeSlash } from '@phosphor-icons/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { OrbitMark } from '@/components/ui/OrbitLogo';
import { createClient } from '@/lib/supabase/client';
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

type InstitutionSettings = {
  loan_period_days?: number;
  max_loans?: number;
  fine_per_day?: number;
  open_time?: string;
  close_time?: string;
  logo_url?: string;
};

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
  photoUrl,
  uploading,
  setColor,
  onFileSelected,
}: {
  initials: string;
  color: AvatarColor;
  photoUrl: string | null;
  uploading: boolean;
  setColor: (c: AvatarColor) => void;
  onFileSelected: (preview: string, file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(URL.createObjectURL(file), file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Avatar" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: color.fg, border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            {initials}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#2C3A47', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', border: '2px solid white' }}>✎</div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="secondary" type="button" onClick={() => setOpen(o => !o)}>Change Colour</Button>
        <Button size="sm" variant="secondary" type="button" loading={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </Button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFile} />
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

// ── AvatarCircle ──────────────────────────────────────────────────────────────

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

// ── Toast ─────────────────────────────────────────────────────────────────────

function useSimpleToast() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const show = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 2800); };
  const el = msg ? (
    <div className={`fixed bottom-20 right-4 z-50 px-4 py-3 rounded-2xl text-sm font-bold shadow-xl pointer-events-none ${msg.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {msg.ok ? '✓' : '✕'} {msg.text}
    </div>
  ) : null;
  return { show, el };
}

// ── SettingsTabs ──────────────────────────────────────────────────────────────

export default function SettingsTabs({ institution, profile, userEmail, bookCount, memberCount, tierInfo }: Props) {
  const router = useRouter();
  const toast = useSimpleToast();

  const TABS = [
    { id: 'profile',       label: 'Profile',      icon: '👤' },
    { id: 'school',        label: 'School',        icon: '🏫' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance',    label: 'Appearance',    icon: '🎨' },
    { id: 'team',          label: 'Team',          icon: '👥' },
  ] as const;

  type TabId = (typeof TABS)[number]['id'];
  const [tab, setTab] = useState<TabId>('profile');

  // ── Profile state ────────────────────────────────────────────────────────
  const nameParts = (profile?.full_name ?? '').split(' ');
  const [firstName,       setFirstName]       = useState(nameParts[0] ?? '');
  const [lastName,        setLastName]        = useState(nameParts.slice(1).join(' ') ?? '');
  const [jobTitle,        setJobTitle]        = useState(profile?.role ?? '');
  const [email,           setEmail]           = useState(userEmail ?? profile?.email ?? '');
  const [phone,           setPhone]           = useState(profile?.phone ?? '');
  const [bio,             setBio]             = useState('');
  const [avatarColor,     setAvatarColor]     = useState<AvatarColor>(AVATAR_COLORS[0]);
  const [avatarPhoto,     setAvatarPhoto]     = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarFile,      setAvatarFile]      = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const initials = getInitials((`${firstName} ${lastName}`.trim()) || (profile?.full_name ?? '?'));

  // Load bio from localStorage after mount (no DB column — saved per device)
  useEffect(() => {
    if (profile?.id) {
      setBio(localStorage.getItem(`orbit_bio_${profile.id}`) ?? '');
    }
  }, [profile?.id]);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError,  setProfileError]  = useState('');

  const [currentPw,      setCurrentPw]      = useState('');
  const [newPw,          setNewPw]          = useState('');
  const [confirmPw,      setConfirmPw]      = useState('');
  const [showCurrentPw,  setShowCurrentPw]  = useState(false);
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [pwSaving,       setPwSaving]       = useState(false);
  const [pwError,        setPwError]        = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true); setProfileError('');

    let savedAvatarUrl: string | null | undefined = undefined; // undefined = don't touch the DB field

    // Upload new photo if one was selected
    if (avatarFile) {
      setAvatarUploading(true);
      const fd = new FormData();
      fd.append('file', avatarFile);
      const uploadRes = await fetch('/api/settings/avatar', { method: 'POST', body: fd });
      setAvatarUploading(false);
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        savedAvatarUrl = url;
        setAvatarPhoto(url);  // replace blob URL with permanent URL
        setAvatarFile(null);
      } else {
        const { error } = await uploadRes.json();
        setProfileError(error ?? 'Photo upload failed');
        setProfileSaving(false);
        return;
      }
    }

    // Persist bio locally (no dedicated DB column)
    if (profile?.id) {
      localStorage.setItem(`orbit_bio_${profile.id}`, bio);
    }

    const full_name = `${firstName} ${lastName}`.trim();
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name,
        phone,
        role: jobTitle.trim() || undefined,
        ...(savedAvatarUrl !== undefined && { avatar_url: savedAvatarUrl }),
      }),
    });
    const data = await res.json();
    setProfileSaving(false);
    if (!res.ok) { setProfileError(data.error ?? 'Save failed'); toast.show('Save failed', false); }
    else { toast.show('Profile saved'); router.refresh(); }
  };

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw || !confirmPw) { setPwError('All password fields are required'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }

    setPwSaving(true); setPwError('');
    const supabase = createClient();

    // Re-authenticate with current password first
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email,
      password: currentPw,
    });

    if (signInErr) {
      setPwSaving(false);
      setPwError('Current password is incorrect');
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (updateErr) { setPwError(updateErr.message); }
    else { toast.show('Password updated'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ── School state ─────────────────────────────────────────────────────────
  const institutionSettings = (institution?.settings ?? {}) as InstitutionSettings;
  const [schoolName,      setSchoolName]      = useState(institution?.name ?? '');
  const [contactEmail,    setContactEmail]    = useState(institution?.contact_email ?? '');
  const [contactPhone,    setContactPhone]    = useState(institution?.contact_phone ?? '');
  const [logoUrl,         setLogoUrl]         = useState(institutionSettings.logo_url ?? '');
  const [logoFile,        setLogoFile]        = useState<File | null>(null);
  const [logoUploading,   setLogoUploading]   = useState(false);
  const [logoPreview,     setLogoPreview]     = useState<string | null>(institutionSettings.logo_url ?? null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [loanDays,        setLoanDays]        = useState(String(institutionSettings.loan_period_days ?? 14));
  const [maxBooks,        setMaxBooks]        = useState(String(institutionSettings.max_loans ?? 3));
  const [finePerDay,      setFinePerDay]      = useState(String(institutionSettings.fine_per_day ?? 0));
  const [openTime,        setOpenTime]        = useState(institutionSettings.open_time ?? '07:30');
  const [closeTime,       setCloseTime]       = useState(institutionSettings.close_time ?? '15:30');
  const [schoolSaving,    setSchoolSaving]    = useState(false);
  const [schoolSaved,     setSchoolSaved]     = useState(false);
  const [schoolError,     setSchoolError]     = useState('');

  const handleSchoolSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSaving(true); setSchoolError('');

    let finalLogoUrl = logoUrl.trim() || null;

    // Upload logo file if one was selected
    if (logoFile) {
      setLogoUploading(true);
      const fd = new FormData();
      fd.append('file', logoFile);
      const uploadRes = await fetch('/api/settings/school-logo', { method: 'POST', body: fd });
      setLogoUploading(false);
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        finalLogoUrl = url;
        setLogoUrl(url);
        setLogoPreview(url);
        setLogoFile(null);
      } else {
        const { error } = await uploadRes.json();
        setSchoolError(error ?? 'Logo upload failed');
        setSchoolSaving(false);
        return;
      }
    }

    const res = await fetch('/api/settings/institution', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: schoolName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
        settings: {
          ...institutionSettings,
          loan_period_days: parseInt(loanDays) || 14,
          max_loans: parseInt(maxBooks) || 3,
          fine_per_day: parseFloat(finePerDay) || 0,
          open_time: openTime,
          close_time: closeTime,
          logo_url: finalLogoUrl,
        },
      }),
    });
    const data = await res.json();
    setSchoolSaving(false);
    if (!res.ok) { setSchoolError(data.error ?? 'Save failed'); toast.show('Save failed', false); }
    else { setSchoolSaved(true); toast.show('School settings saved'); setTimeout(() => setSchoolSaved(false), 3000); router.refresh(); }
  };

  // ── Notifications state (persisted in institution.settings.notifications) ─
  const savedNotifs = (institutionSettings as Record<string, unknown>).notifications as Record<string, boolean> | undefined;
  const [notifs, setNotifs] = useState({
    smsOverdue:         savedNotifs?.smsOverdue         ?? true,
    smsReminder:        savedNotifs?.smsReminder        ?? true,
    emailCheckout:      savedNotifs?.emailCheckout      ?? true,
    emailReturn:        savedNotifs?.emailReturn        ?? true,
    emailDueReminder:   savedNotifs?.emailDueReminder   ?? true,
    emailOverdue:       savedNotifs?.emailOverdue       ?? true,
    emailWeeklySummary: savedNotifs?.emailWeeklySummary ?? true,
    emailMonthlyReport: savedNotifs?.emailMonthlyReport ?? true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const setNotif = (k: keyof typeof notifs, v: boolean) => setNotifs(n => ({ ...n, [k]: v }));

  const handleNotifSave = async () => {
    setNotifSaving(true);
    const res = await fetch('/api/settings/institution', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: institution?.name ?? '',
        contact_email: institution?.contact_email ?? '',
        settings: { ...institutionSettings, notifications: notifs },
      }),
    });
    setNotifSaving(false);
    if (res.ok) { toast.show('Notification preferences saved'); }
    else { toast.show('Save failed', false); }
  };

  // ── Appearance state — loaded from institution.settings.display_prefs ────
  type Density = 'compact' | 'comfortable' | 'spacious';
  const savedPrefs = (institutionSettings as Record<string, unknown>).display_prefs as Record<string, string | boolean> | undefined;
  const [accentColor,   setAccentColor]   = useState<string>(String(savedPrefs?.accentColor ?? 'steel'));
  const [dateFormat,    setDateFormat]    = useState<string>(String(savedPrefs?.dateFormat  ?? 'dd/mm/yyyy'));
  const [density,       setDensity]       = useState<Density>((savedPrefs?.density as Density) ?? 'comfortable');
  const [darkSidebar,   setDarkSidebar]   = useState<boolean>(savedPrefs?.darkSidebar !== false);
  const [appearSaving,  setAppearSaving]  = useState(false);

  // Apply density to localStorage so DashboardShell can read it
  useEffect(() => {
    if (savedPrefs?.density) localStorage.setItem('orbit_density', String(savedPrefs.density));
    if (savedPrefs?.darkSidebar !== undefined) localStorage.setItem('orbit_dark_sidebar', String(savedPrefs.darkSidebar));
  }, [savedPrefs]);

  const handleAppearSave = async () => {
    setAppearSaving(true);
    const prefs = { accentColor, dateFormat, density, darkSidebar };
    // Persist to localStorage immediately for sidebar/density to pick up
    localStorage.setItem('orbit_density',      density);
    localStorage.setItem('orbit_dark_sidebar', String(darkSidebar));
    // Persist to DB so settings survive device changes
    const res = await fetch('/api/settings/institution', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:          institution?.name          ?? '',
        contact_email: institution?.contact_email ?? '',
        settings: { ...institutionSettings, display_prefs: prefs },
      }),
    });
    setAppearSaving(false);
    if (res.ok) {
      toast.show('Appearance preferences saved');
      // Dispatch event so DashboardShell updates without page reload
      window.dispatchEvent(new CustomEvent('orbit-prefs-changed', { detail: prefs }));
    } else {
      toast.show('Save failed', false);
    }
  };

  // ── Team state ───────────────────────────────────────────────────────────
  const [team, setTeam] = useState([
    { id: 't1', name: 'Naledi Dube',   role: 'Head Librarian', email: 'naledi.dube@tshiamiso.edu.za', status: 'active',  last: 'Today'     },
    { id: 't2', name: 'Sipho Khumalo', role: 'Librarian',      email: 'sipho.k@tshiamiso.edu.za',     status: 'active',  last: 'Yesterday' },
    { id: 't3', name: 'Amara Osei',    role: 'Volunteer',      email: 'amara.o@tshiamiso.edu.za',     status: 'pending', last: 'Never'     },
  ]);
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteEmail,  setInviteEmail]  = useState('');
  const [inviteRole,   setInviteRole]   = useState('Librarian');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError,  setInviteError]  = useState('');

  const ACCENT_SWATCHES = [
    { k: 'steel',    c: '#4B8EBA', l: 'Steel'    },
    { k: 'slate',    c: '#2C3A47', l: 'Slate'    },
    { k: 'golden',   c: '#F6B93B', l: 'Golden'   },
    { k: 'lavender', c: '#A29FEC', l: 'Lavender' },
    { k: 'green',    c: '#22c55e', l: 'Green'    },
    { k: 'red',      c: '#ef4444', l: 'Red'      },
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
            style={{ padding: '8px 14px', background: tab === t.id ? 'linear-gradient(135deg,#C4C0FB,#4B8EBA)' : 'transparent', color: tab === t.id ? 'white' : 'rgba(44,58,71,0.55)', fontFamily: 'inherit', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
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
            <AvatarPicker
              initials={initials}
              color={avatarColor}
              photoUrl={avatarPhoto}
              uploading={avatarUploading}
              setColor={setAvatarColor}
              onFileSelected={(preview, file) => { setAvatarPhoto(preview); setAvatarFile(file); }}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: '#2C3A47' }}>{firstName} {lastName}</p>
              <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>{jobTitle || profile?.role || 'User'}</p>
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
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <Input label="Last Name"  value={lastName}  onChange={e => setLastName(e.target.value)}  required />
              </div>
              <Input label="Job Title / Role" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Head Librarian" />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Phone Number"  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>Bio</label>
                  <span style={{ fontSize: 11, color: 'rgba(44,58,71,0.4)' }}>Saved on this device</span>
                </div>
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

              {profileError && <p className="text-sm text-red-600">{profileError}</p>}

              {/* Change Password */}
              <div style={{ borderTop: '1px solid rgba(44,58,71,0.07)', paddingTop: 16, marginTop: 4 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', marginBottom: 14 }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Input
                    label="Current Password"
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    rightElement={
                      <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="text-slate/40 hover:text-slate transition-colors" aria-label={showCurrentPw ? 'Hide password' : 'Show password'}>
                        {showCurrentPw ? <EyeSlash weight="light" className="w-4 h-4" /> : <Eye weight="light" className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="New Password"
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 8 characters"
                      rightElement={
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="text-slate/40 hover:text-slate transition-colors" aria-label={showNewPw ? 'Hide password' : 'Show password'}>
                          {showNewPw ? <EyeSlash weight="light" className="w-4 h-4" /> : <Eye weight="light" className="w-4 h-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="Confirm Password"
                      type={showNewPw ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      rightElement={
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="text-slate/40 hover:text-slate transition-colors" aria-label={showNewPw ? 'Hide password' : 'Show password'}>
                          {showNewPw ? <EyeSlash weight="light" className="w-4 h-4" /> : <Eye weight="light" className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
                <Button type="submit" loading={profileSaving}>Save Profile</Button>
                <Button variant="secondary" type="button" loading={pwSaving} onClick={handlePasswordChange}>
                  Update Password
                </Button>
                <Button variant="danger" type="button" onClick={handleSignOut}>Sign Out</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ SCHOOL ════ */}
      {tab === 'school' && (
        <div style={{ maxWidth: 620 }}>
          {/* School logo card */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47', marginBottom: 16 }}>School Logo</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              {/* Logo preview */}
              <div style={{ width: 90, height: 90, borderRadius: 16, background: '#2C3A47', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(44,58,71,0.1)' }}>
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={() => { setLogoPreview(null); setLogoUrl(''); }} />
                ) : (
                  <OrbitMark width={52} dark={true} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#2C3A47' }}>{institution?.name ?? '—'}</p>
                <p style={{ fontSize: 13, color: 'rgba(44,58,71,0.5)', marginTop: 2, marginBottom: 14 }}>
                  {institution?.province}{institution?.province && institution?.type ? ' · ' : ''}{institution?.type ? `${institution.type} School` : ''}
                </p>

                {/* Upload button */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    size="sm"
                    loading={logoUploading}
                    onClick={() => logoFileRef.current?.click()}
                  >
                    {logoUploading ? 'Uploading…' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logoPreview && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => { setLogoPreview(null); setLogoUrl(''); setLogoFile(null); }}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setLogoFile(f);
                      setLogoPreview(URL.createObjectURL(f));
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* OR paste a URL */}
                <Input
                  label="Or paste a logo URL"
                  value={logoUrl}
                  onChange={e => { setLogoUrl(e.target.value); setLogoPreview(e.target.value || null); setLogoFile(null); }}
                  placeholder="https://yourschool.co.za/logo.png"
                />
                <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.4)', marginTop: 4 }}>
                  PNG, JPG, WebP or SVG · max 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* School details form */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24 }}>
            <form onSubmit={handleSchoolSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47' }}>School Details</h2>

              <Input label="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} required />

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
                    <CheckCircle weight="light" className="w-4 h-4" /> Saved
                  </span>
                )}
                <Button type="submit" loading={schoolSaving} className={schoolSaved ? '' : 'ml-auto'}>
                  Save School Settings
                </Button>
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
          <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginBottom: 18 }}>Changes are saved to your school settings and take effect immediately.</p>

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1">SMS Alerts</p>
          <NotifRow label="Overdue SMS to Learners"  desc="Automatically SMS learners with overdue books each night" value={notifs.smsOverdue}   onChange={v => setNotif('smsOverdue', v)} />
          <NotifRow label="Due Date Reminder SMS"    desc="Remind learners 2 days before their book is due"         value={notifs.smsReminder}  onChange={v => setNotif('smsReminder', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Learner Emails</p>
          <NotifRow label="Checkout Confirmation"    desc="Email the learner when a book is checked out to them"    value={notifs.emailCheckout}    onChange={v => setNotif('emailCheckout', v)} />
          <NotifRow label="Return Confirmation"      desc="Email the learner when their book return is processed"   value={notifs.emailReturn}      onChange={v => setNotif('emailReturn', v)} />
          <NotifRow label="Due Date Reminder Email"  desc="Email learners 2 days before their book is due"         value={notifs.emailDueReminder} onChange={v => setNotif('emailDueReminder', v)} />
          <NotifRow label="Overdue Notice Email"     desc="Email learners when their book becomes overdue"         value={notifs.emailOverdue}     onChange={v => setNotif('emailOverdue', v)} />

          <p className="text-[10px] font-bold tracking-[2px] uppercase text-slate/40 mb-1 mt-5">Admin Reports</p>
          <NotifRow label="Weekly Summary"           desc="Library overview email to admin every Monday morning"   value={notifs.emailWeeklySummary} onChange={v => setNotif('emailWeeklySummary', v)} />
          <NotifRow label="Monthly Overdue Report"   desc="Full overdue report to admin on the 1st of each month" value={notifs.emailMonthlyReport} onChange={v => setNotif('emailMonthlyReport', v)} />

          <div style={{ paddingTop: 20 }}>
            <Button type="button" loading={notifSaving} onClick={handleNotifSave}>Save Preferences</Button>
          </div>
        </div>
      )}

      {/* ════ APPEARANCE ════ */}
      {tab === 'appearance' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(44,58,71,0.08)', padding: 24, maxWidth: 520 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#2C3A47', marginBottom: 18 }}>Display Preferences</h2>

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

          <div style={{ marginBottom: 18 }}>
            <label className="text-sm font-semibold text-slate block mb-1.5">Date Format</label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel cursor-pointer" style={{ fontFamily: 'inherit' }}>
              <option value="dd/mm/yyyy">DD/MM/YYYY (22/04/2026)</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY (04/22/2026)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (2026-04-22)</option>
              <option value="long">Long (22 April 2026)</option>
            </select>
          </div>

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

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(44,58,71,0.07)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>Dark Sidebar</p>
              <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>Use the dark colour scheme for the navigation sidebar</p>
            </div>
            <Toggle value={darkSidebar} onChange={v => { setDarkSidebar(v); toast.show(v ? 'Dark sidebar enabled' : 'Light sidebar enabled'); }} />
          </div>

          <div style={{ paddingTop: 12 }}>
            <Button type="button" loading={appearSaving} onClick={handleAppearSave}>Save Preferences</Button>
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
              <Button size="sm" type="button" onClick={() => setShowInvite(true)}>+ Invite Staff</Button>
            </div>
            {team.map((member, i) => (
              <div key={member.id} className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: i < team.length - 1 ? '1px solid rgba(44,58,71,0.06)' : 'none' }}>
                <AvatarCircle name={member.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47' }}>{member.name}</p>
                    <Badge variant={member.status === 'active' ? 'steel' : 'warning'}>{member.status === 'active' ? 'Active' : 'Pending'}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>{member.role}</p>
                  <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {member.status === 'pending' && (
                      <Button size="sm" variant="secondary" type="button" onClick={() => { setTeam(t => t.map(m => m.id === member.id ? { ...m, status: 'active', last: 'Just now' } : m)); toast.show(`${member.name} approved`); }}>Approve</Button>
                    )}
                    <Button size="sm" variant="ghost" type="button" onClick={() => { setTeam(t => t.filter(m => m.id !== member.id)); toast.show(`${member.name} removed`); }}>Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(75,142,186,0.06)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(75,142,186,0.15)' }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#4B8EBA', marginBottom: 10 }}>Role Permissions</p>
            {[
              { role: 'Administrator',  perms: 'Full access — settings, team, reports, all data',              v: 'golden'  },
              { role: 'Head Librarian', perms: 'All library functions — add books, manage loans, view reports', v: 'steel'   },
              { role: 'Librarian',      perms: 'Check in/out, manage catalogue, view learners',                v: 'neutral' },
              { role: 'Volunteer',      perms: 'Check in/out books only',                                       v: 'neutral' },
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
            An invitation email will be sent to the address above with a link to sign up.
          </div>
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={!inviteEmail}
              loading={inviteSending}
              onClick={async () => {
                setInviteSending(true); setInviteError('');
                const res = await fetch('/api/email/invite', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
                });
                const data = await res.json();
                setInviteSending(false);
                if (!res.ok) { setInviteError(data.error ?? 'Failed to send'); return; }
                setTeam(t => [...t, { id: `t${Date.now()}`, name: inviteEmail.split('@')[0], role: inviteRole, email: inviteEmail, status: 'pending', last: 'Never' }]);
                toast.show(`Invite sent to ${inviteEmail}`);
                setShowInvite(false); setInviteEmail(''); setInviteError('');
              }}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {tab === 'profile' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate/5 border border-slate/10 mt-4" style={{ maxWidth: 760 }}>
          <ShieldCheck weight="light" className="w-4 h-4 text-slate/30 mt-0.5 shrink-0" />
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
