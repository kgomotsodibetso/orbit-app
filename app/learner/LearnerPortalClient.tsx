'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrbitMark } from '@/components/ui/OrbitLogo';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookRow {
  id: string;
  title: string;
  authors: string[] | null;
  subject_area: string | null;
  available_copies: number;
}

interface LoanRow {
  id: string;
  status: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  books: { id: string; title: string; cover_url: string | null; authors: string[] | null } | null;
}

interface MemberRow {
  id: string;
  full_name: string;
  member_number: string;
  grade: string | null;
  class_name: string | null;
  max_loans: number;
}

interface Props {
  member: MemberRow;
  loans: LoanRow[];
  books: BookRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DueCountdown({ due, status }: { due: string; status: string }) {
  if (status === 'returned') return null;
  const days = daysUntil(due);
  if (days < 0) return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚠ {Math.abs(days)} days overdue</span>;
  if (days === 0) return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Due today!</span>;
  if (days <= 3)  return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Due in {days} day{days !== 1 ? 's' : ''}</span>;
  return <span className="text-xs font-semibold text-slate/45">Due {fmtDate(due)}</span>;
}

// ── BookCover — coloured SVG placeholder ──────────────────────────────────────

const COVER_PALETTES = [
  ['#4B8EBA','#2E6A90'], ['#2C3A47','#141E26'], ['#F6B93B','#A86808'],
  ['#A29FEC','#7470BE'], ['#3D7A50','#1E4828'], ['#8B6347','#5C3C28'],
  ['#C45B5B','#8B2020'], ['#4B7EAA','#1C4E7A'],
];

function BookCover({ title, width = 40, height = 56 }: { title: string; width?: number; height?: number }) {
  const idx = (title.charCodeAt(0) || 0) % COVER_PALETTES.length;
  const [c1, c2] = COVER_PALETTES[idx];
  const gid = `bc${idx}${title.length}`;
  return (
    <svg width={width} height={height} viewBox="0 0 40 56" style={{ flexShrink: 0, borderRadius: 3, display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/></linearGradient></defs>
      <rect width="40" height="56" rx="2.5" fill={`url(#${gid})`}/>
      <rect x="3" y="4" width="3" height="48" rx="1" fill="rgba(0,0,0,0.18)"/>
      <rect x="8" y="10" width="24" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
      <rect x="8" y="14" width="18" height="1"   rx="0.5"  fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const ini = name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  const palettes = ['#4B8EBA20,#4B8EBA','#F6B93B20,#92680a','#A29FEC20,#4845a0','#22c55e20,#15803d'];
  const [bg, fg] = palettes[(name.charCodeAt(0) ?? 0) % palettes.length].split(',');
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>
      {ini}
    </div>
  );
}

// ── Static demo data ──────────────────────────────────────────────────────────

const RECOMMENDATIONS = [
  { title: 'Animal Farm',               author: 'George Orwell',      reason: 'Based on your Fiction reads' },
  { title: 'The Great Gatsby',          author: 'F. Scott Fitzgerald', reason: 'Popular in your grade'      },
  { title: 'Born a Crime',              author: 'Trevor Noah',         reason: 'South African literature'   },
  { title: 'The Diary of a Young Girl', author: 'Anne Frank',          reason: 'Similar to your history'    },
];

const NOTIFICATIONS_INIT = [
  { id: 'n1', type: 'overdue',   title: 'Book overdue',            body: '"To Kill a Mockingbird" was due on 15 Apr. Please return it.',       time: '2 days ago', read: false },
  { id: 'n2', type: 'reminder',  title: 'Due in 3 days',           body: '"Things Fall Apart" is due on 19 Apr.',                              time: 'Yesterday',  read: false },
  { id: 'n3', type: 'available', title: 'Reserved book available', body: '"Born a Crime" is now available for pickup at the library.',         time: '3 days ago', read: true  },
  { id: 'n4', type: 'new',       title: 'New book added',          body: '"The Heaven & Earth Grocery Store" has been added to the catalogue.', time: '1 week ago', read: true  },
];

const READING_GOAL = 12;

// ── Main component ────────────────────────────────────────────────────────────

export default function LearnerPortalClient({ member, loans, books }: Props) {
  const [tab, setTab] = useState<'home' | 'books' | 'browse' | 'history' | 'notifs'>('home');
  const [q, setQ] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [notifs, setNotifs] = useState(NOTIFICATIONS_INIT);
  const [renewRequested, setRenewRequested] = useState<Record<string, boolean>>({});

  const activeLoans   = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const overdueLoans  = loans.filter(l => l.status === 'overdue');
  const returnedLoans = loans.filter(l => l.status === 'returned' || l.status === 'lost');
  const booksThisYear = returnedLoans.length + 3;
  const unread        = notifs.filter(n => !n.read).length;

  // Genre list from real books
  const genres = ['All', ...Array.from(new Set(books.map(b => b.subject_area ?? 'General').filter(Boolean)))];
  const filteredBooks = books.filter(b => {
    const mq = !q || b.title.toLowerCase().includes(q.toLowerCase()) || (b.authors?.join(' ') ?? '').toLowerCase().includes(q.toLowerCase());
    const mg = genreFilter === 'All' || b.subject_area === genreFilter;
    return mq && mg;
  });

  function requestRenewal(loanId: string, title: string) {
    setRenewRequested(r => ({ ...r, [loanId]: true }));
  }

  const TABS = [
    { id: 'home'    as const, icon: '⊞',  label: 'Home'     },
    { id: 'books'   as const, icon: '📖', label: 'My Books' },
    { id: 'browse'  as const, icon: '🔍', label: 'Browse'   },
    { id: 'history' as const, icon: '📋', label: 'History'  },
    { id: 'notifs'  as const, icon: '🔔', label: 'Alerts', badge: unread },
  ];

  const firstName = member.full_name.split(' ')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0E5DF' }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(44,58,71,0.08)', padding: '11px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 10, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <OrbitMark width={24} dark={false} />
          <span style={{ fontWeight: 800, fontSize: 13, color: '#2C3A47' }}>Learner Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={member.full_name} size={28} />
          <div className="hidden sm:block">
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2C3A47', lineHeight: 1 }}>{member.full_name}</p>
            <p style={{ fontSize: 10, color: 'rgba(44,58,71,0.5)', marginTop: 1 }}>{member.grade ? `Grade ${member.grade}` : ''}</p>
          </div>
          <Link href="/learner/logout">
            <Button size="sm" variant="secondary">Sign Out</Button>
          </Link>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(44,58,71,0.06)', display: 'flex', overflowX: 'auto', flexShrink: 0, position: 'sticky', top: 48, zIndex: 9 }}>
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '11px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#C4C0FB' : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700, color: tab === t.id ? '#4B8EBA' : 'rgba(44,58,71,0.5)', transition: 'all 0.12s', position: 'relative', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
            {'badge' in t && (t.badge ?? 0) > 0 && (
              <span style={{ position: 'absolute', top: 8, right: 6, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* ════ HOME ════ */}
        {tab === 'home' && <>
          {/* Welcome hero */}
          <div style={{ background: '#2C3A47', borderRadius: 20, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.055, pointerEvents: 'none' }}>
              <OrbitMark width={140} dark={false} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(240,229,223,0.4)', marginBottom: 6 }}>Welcome back</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#F0E5DF', letterSpacing: '-0.5px' }}>{firstName} 👋</p>
            <p style={{ fontSize: 12, color: 'rgba(240,229,223,0.5)', marginTop: 2 }}>
              {member.grade ? `Grade ${member.grade}` : ''}{member.class_name ? ` · ${member.class_name}` : ''} · {member.member_number}
            </p>
            {overdueLoans.length > 0 && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(239,68,68,0.15)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>{overdueLoans.length} book{overdueLoans.length > 1 ? 's' : ''} overdue — please return to the library</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { l: 'Books Out',      v: activeLoans.length,  c: '#4B8EBA', bg: 'rgba(75,142,186,0.08)'  },
              { l: 'Overdue',        v: overdueLoans.length, c: overdueLoans.length > 0 ? '#dc2626' : '#22c55e', bg: overdueLoans.length > 0 ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)' },
              { l: 'Read This Year', v: booksThisYear,       c: '#2C3A47', bg: 'rgba(44,58,71,0.05)'    },
            ].map(s => (
              <div key={s.l} style={{ background: 'white', borderRadius: 14, padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(44,58,71,0.07)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: s.bg, borderRadius: 14 }}/>
                <div style={{ position: 'relative', fontSize: 26, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ position: 'relative', fontSize: 10, fontWeight: 700, color: 'rgba(44,58,71,0.5)', marginTop: 4, lineHeight: 1.3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Reading goal */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(44,58,71,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47' }}>Reading Goal {new Date().getFullYear()}</p>
                <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 1 }}>{booksThisYear} of {READING_GOAL} books</p>
              </div>
              <span style={{ fontSize: 22 }}>{booksThisYear >= READING_GOAL ? '🏆' : '📚'}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(44,58,71,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: 8, background: '#F6B93B', borderRadius: 99, width: `${Math.min((booksThisYear / READING_GOAL) * 100, 100)}%`, transition: 'width 0.6s ease' }}/>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.45)', marginTop: 6 }}>
              {READING_GOAL - booksThisYear > 0 ? `${READING_GOAL - booksThisYear} more to reach your goal!` : '🎉 Goal reached — keep reading!'}
            </p>
          </div>

          {/* Currently borrowed */}
          {activeLoans.length > 0 ? (
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', marginBottom: 10 }}>Currently Borrowed</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeLoans.map(loan => {
                  const book  = loan.books;
                  const isOvd = loan.status === 'overdue';
                  const renewed = renewRequested[loan.id];
                  return (
                    <div key={loan.id} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${isOvd ? '#fecaca' : 'rgba(44,58,71,0.07)'}` }}>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <BookCover title={book?.title ?? ''} width={48} height={67} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book?.title}</p>
                          <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 2 }}>{book?.authors?.join(', ')}</p>
                          <div style={{ marginTop: 8 }}><DueCountdown due={loan.due_date} status={loan.status} /></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid rgba(44,58,71,0.06)', paddingTop: 12 }}>
                        {!isOvd && (
                          <Button size="sm" variant={renewed ? 'secondary' : 'ghost'} disabled={renewed} onClick={() => requestRenewal(loan.id, book?.title ?? '')}>
                            {renewed ? '✓ Renewal Requested' : '↻ Request Renewal'}
                          </Button>
                        )}
                        {isOvd && <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>⚠ Please return this book urgently</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, padding: '32px 20px', textAlign: 'center', border: '1px solid rgba(44,58,71,0.07)' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📚</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2C3A47' }}>No books checked out</p>
              <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.5)', marginTop: 4 }}>Visit the library to borrow a book</p>
              <div style={{ marginTop: 14 }}><Button size="sm" onClick={() => setTab('browse')}>Browse Catalogue</Button></div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47', marginBottom: 10 }}>Recommended for You</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {RECOMMENDATIONS.map(r => (
                <div key={r.title} style={{ background: 'white', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(44,58,71,0.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <BookCover title={r.title} width={36} height={50} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#2C3A47', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.5)', marginTop: 1 }}>{r.author}</p>
                    <p style={{ fontSize: 10, color: '#4B8EBA', fontWeight: 600, marginTop: 4 }}>{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ════ MY BOOKS ════ */}
        {tab === 'books' && <>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#2C3A47' }}>My Books</p>
          {activeLoans.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '36px 20px', textAlign: 'center', border: '1px solid rgba(44,58,71,0.07)' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2C3A47' }}>No books currently borrowed</p>
              <div style={{ marginTop: 12 }}><Button size="sm" onClick={() => setTab('browse')}>Browse books</Button></div>
            </div>
          ) : activeLoans.map(loan => {
            const book  = loan.books;
            const isOvd = loan.status === 'overdue';
            const renewed = renewRequested[loan.id];
            return (
              <div key={loan.id} style={{ background: 'white', borderRadius: 18, border: `2px solid ${isOvd ? '#fecaca' : 'rgba(44,58,71,0.08)'}`, overflow: 'hidden' }}>
                {isOvd && (
                  <div style={{ background: '#dc2626', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, color: 'white' }}>⚠</span>
                    <p style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>OVERDUE — Please return immediately</p>
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <BookCover title={book?.title ?? ''} width={56} height={78} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#2C3A47', lineHeight: 1.3 }}>{book?.title}</p>
                      <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.55)', marginTop: 2 }}>{book?.authors?.join(', ')}</p>
                      <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.4)', marginTop: 3 }}>Borrowed {fmtDate(loan.checked_out_at)}</p>
                      <div style={{ marginTop: 8 }}><DueCountdown due={loan.due_date} status={loan.status} /></div>
                    </div>
                  </div>
                  {!isOvd && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <Button size="sm" variant={renewed ? 'secondary' : 'primary'} disabled={renewed} onClick={() => requestRenewal(loan.id, book?.title ?? '')}>
                        {renewed ? '✓ Renewal Sent' : '↻ Renew'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>}

        {/* ════ BROWSE ════ */}
        {tab === 'browse' && <>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#2C3A47' }}>Browse Catalogue</p>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(44,58,71,0.35)', fontSize: 14 }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title or author…"
              style={{ width: '100%', borderRadius: 14, border: '1.5px solid rgba(44,58,71,0.15)', background: 'white', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, fontSize: 13, fontFamily: 'inherit', color: '#2C3A47', outline: 'none' }}/>
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {genres.map(g => (
              <button key={g} type="button" onClick={() => setGenreFilter(g)}
                style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: `1.5px solid ${genreFilter === g ? 'transparent' : 'rgba(44,58,71,0.15)'}`, background: genreFilter === g ? 'linear-gradient(135deg,#C4C0FB,#4B8EBA)' : 'white', color: genreFilter === g ? 'white' : 'rgba(44,58,71,0.6)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.1s', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                {g}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filteredBooks.map(b => (
              <div key={b.id} style={{ background: 'white', borderRadius: 14, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', border: '1px solid rgba(44,58,71,0.07)' }}>
                <BookCover title={b.title} width={54} height={75} />
                <p style={{ fontSize: 12, fontWeight: 800, color: '#2C3A47', lineHeight: 1.3 }}>{b.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.45)' }}>{b.authors?.join(', ')}</p>
                <Badge variant={b.available_copies > 0 ? 'steel' : 'neutral'}>
                  {b.available_copies > 0 ? `${b.available_copies} available` : 'Checked out'}
                </Badge>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'rgba(44,58,71,0.4)', fontSize: 13 }}>No books found</div>
            )}
          </div>
        </>}

        {/* ════ HISTORY ════ */}
        {tab === 'history' && <>
          {/* Stats */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(44,58,71,0.07)', display: 'flex', gap: 16, alignItems: 'center' }}>
            {[
              { v: loans.length,         l: 'Total Loans', c: '#4B8EBA' },
              { v: returnedLoans.length, l: 'Returned',    c: '#22c55e' },
              { v: booksThisYear,        l: 'This Year',   c: '#F6B93B' },
            ].map((s, i) => (
              <div key={s.l} style={{ textAlign: 'center', flex: 1 }}>
                {i > 0 && <div style={{ position: 'absolute', width: 1, height: 40, background: 'rgba(44,58,71,0.08)' }}/>}
                <p style={{ fontSize: 24, fontWeight: 900, color: s.c }}>{s.v}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(44,58,71,0.5)' }}>{s.l}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 800, color: '#2C3A47' }}>All Loans ({loans.length})</p>

          {loans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(44,58,71,0.4)', fontSize: 13 }}>No loan history yet</div>
          ) : loans.map(loan => {
            const book = loan.books;
            const statusColors: Record<string, string> = { active: 'bg-steel/10 text-steel', returned: 'bg-green-50 text-green-700', overdue: 'bg-red-50 text-red-700', lost: 'bg-slate/10 text-slate/60' };
            const sc = statusColors[loan.status] ?? statusColors.active;
            return (
              <div key={loan.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', border: '1px solid rgba(44,58,71,0.07)' }}>
                <BookCover title={book?.title ?? ''} width={36} height={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#2C3A47', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book?.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.45)', marginTop: 2 }}>
                    {fmtDate(loan.checked_out_at)} → {loan.status === 'returned' ? fmtDate(loan.returned_at) : 'Present'}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${sc}`}>
                  {loan.status}
                </span>
              </div>
            );
          })}
        </>}

        {/* ════ NOTIFICATIONS ════ */}
        {tab === 'notifs' && <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#2C3A47' }}>
              Notifications {unread > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>({unread} unread)</span>}
            </p>
            {unread > 0 && (
              <button type="button" onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
                style={{ fontSize: 12, fontWeight: 700, color: '#4B8EBA', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifs.map(n => {
            const icons: Record<string, string>  = { overdue: '⚠', reminder: '🔔', available: '✅', new: '🆕' };
            const colors: Record<string, string> = { overdue: '#fef2f2', reminder: '#fffbeb', available: '#f0fdf4', new: 'rgba(75,142,186,0.07)' };
            return (
              <div key={n.id}
                onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                style={{ background: n.read ? 'white' : (colors[n.type] ?? 'white'), borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${n.read ? 'rgba(44,58,71,0.07)' : 'rgba(44,58,71,0.12)'}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icons[n.type] ?? '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: n.read ? 600 : 800, color: '#2C3A47' }}>{n.title}</p>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4B8EBA', flexShrink: 0, marginTop: 3 }}/>}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(44,58,71,0.55)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</p>
                  <p style={{ fontSize: 11, color: 'rgba(44,58,71,0.35)', marginTop: 4 }}>{n.time}</p>
                </div>
              </div>
            );
          })}
        </>}

      </div>
    </div>
  );
}
