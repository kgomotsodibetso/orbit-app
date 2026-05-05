// orbit/shared.jsx — Shared UI primitives

// ── OrbitMark — gradient O mark (Brand Guide v6, V1 Cool Diagonal) ───────────
function OrbitMark({ width = 56, dark = false }) {
  // Use a unique id suffix per instance to avoid gradient ID collisions
  const uid = React.useId ? React.useId().replace(/:/g,'') : Math.random().toString(36).slice(2);
  const bodyEnd = dark ? '#2C3A47' : '#1C2830';
  const innerFill = dark ? '#2C3A47' : '#F5F1ED';
  const dotColor  = dark ? '#FFD060' : '#F6B93B';
  const arcEnd    = dark ? 'rgba(255,208,96,0.35)' : 'rgba(246,185,59,0.4)';
  return (
    <svg width={width} height={width} viewBox="0 0 160 160" fill="none" aria-hidden="true" style={{ flexShrink:0 }}>
      <defs>
        <linearGradient id={`om-body-${uid}`} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#C4C0FB"/>
          <stop offset="38%" stopColor="#4B8EBA"/>
          <stop offset="100%" stopColor={bodyEnd}/>
        </linearGradient>
        <linearGradient id={`om-arc-${uid}`} x1="10" y1="35" x2="150" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.95)"/>
          <stop offset="40%" stopColor={dotColor}/>
          <stop offset="100%" stopColor={arcEnd}/>
        </linearGradient>
        <radialGradient id={`om-inner-${uid}`} cx="40%" cy="36%" r="62%">
          <stop offset="0%"   stopColor={dark ? '#303F4C' : '#F9F5F1'}/>
          <stop offset="100%" stopColor={innerFill}/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill={`url(#om-body-${uid})`}/>
      <circle cx="80" cy="80" r="44" fill={`url(#om-inner-${uid})`}/>
      <ellipse cx="80" cy="80" rx="92" ry="23"
        stroke={`url(#om-arc-${uid})`} strokeWidth="7.5"
        fill="none" strokeLinecap="round"
        transform="rotate(-40 80 80)"/>
      <circle cx="140" cy="42" r="9.5" fill={dotColor}/>
      <circle cx="138" cy="40" r="3.8" fill="rgba(255,255,255,0.6)"/>
    </svg>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
function Btn({ variant='primary', size='md', loading=false, disabled=false, onClick, children, className='', type='button', fullWidth=false }) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] cursor-pointer border-0 select-none';
  // Primary uses brand gradient Lavender→Steel per brand guide
  const variantStyles = {
    primary:   { background:'linear-gradient(135deg,#C4C0FB,#4B8EBA)', color:'white', boxShadow:'0 4px 14px rgba(75,142,186,0.32)' },
    secondary: { background:'transparent', color:'#2C3A47', border:'1.5px solid rgba(44,58,71,0.18)' },
    ghost:     { background:'transparent', color:'#4B8EBA', border:'none' },
    danger:    { background:'#FDEAEA', color:'#C43C3C', border:'none' },
    golden:    { background:'linear-gradient(135deg,#FFD060,#F6B93B)', color:'#2C3A47', boxShadow:'0 4px 14px rgba(246,185,59,0.28)' },
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };
  const vs = variantStyles[variant] || variantStyles.primary;
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick}
      className={[base, sizes[size]||sizes.md, fullWidth?'w-full':'', className].join(' ')}
      style={{ fontFamily:'inherit', borderRadius:9999, ...vs }}>
      {loading && <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }}/>}
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
function Inp({ label, error, icon, value, onChange, placeholder, type='text', className='', required=false, autoFocus=false, defaultValue }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/40 pointer-events-none" style={{fontSize:14}}>{icon}</span>}
        <input type={type} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder} required={required} autoFocus={autoFocus}
          className={['w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate placeholder:text-slate/35 transition-colors focus:outline-none focus:ring-2 focus:ring-steel focus:border-transparent',
            error ? 'border-red-400' : 'border-slate/20', icon?'pl-10':'', className].join(' ')}
          style={{ fontFamily:'inherit' }}/>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
function Sel({ label, value, onChange, children, className='' }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate">{label}</label>}
      <select value={value} onChange={onChange}
        className={['w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel cursor-pointer', className].join(' ')}
        style={{ fontFamily:'inherit' }}>{children}</select>
    </div>
  );
}

// ── StatusChip ────────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const cfg = {
    active:   { label:'Active',   cls:'bg-steel/10 text-steel',     dot:'bg-steel'      },
    returned: { label:'Returned', cls:'bg-green-50 text-green-700', dot:'bg-green-500'  },
    overdue:  { label:'Overdue',  cls:'bg-red-50 text-red-700',     dot:'bg-red-500'    },
    lost:     { label:'Lost',     cls:'bg-slate/10 text-slate/60',  dot:'bg-slate/40'   },
  };
  const c = cfg[status]||cfg.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`}/>
      {c.label}
    </span>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ variant='neutral', children, className='' }) {
  const styles = {
    steel:'bg-steel/10 text-steel border-steel/20', golden:'bg-golden/10 text-amber-700 border-golden/30',
    lavender:'bg-lavender/10 text-indigo-700 border-lavender/30', success:'bg-green-50 text-green-700 border-green-200',
    warning:'bg-amber-50 text-amber-700 border-amber-200', danger:'bg-red-50 text-red-700 border-red-200',
    neutral:'bg-slate/8 text-slate border-slate/15',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]||styles.neutral} ${className}`}>{children}</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width='max-w-md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(28,40,48,0.6)', backdropFilter:'blur(6px)' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`bg-white w-full ${width} flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl`} style={{ maxHeight:'90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate/10 shrink-0">
          <h2 className="text-base font-bold text-slate">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate/40 hover:text-slate hover:bg-slate/8 transition-colors text-xl leading-none border-0 bg-transparent cursor-pointer">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const add = React.useCallback((msg, type='success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3000);
  }, []);
  const colors = { success:'#16a34a', error:'#dc2626', info:'#4B8EBA' };
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position:'fixed', bottom:80, right:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none', maxWidth:'calc(100vw - 32px)' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background:colors[t.type]||colors.success, color:'white', padding:'12px 16px', borderRadius:14, fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', animation:'slideUp 0.18s ease', display:'flex', alignItems:'center', gap:10 }}>
            <span>{t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() { return React.useContext(ToastCtx); }

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'dashboard', label:'Mission Control', short:'Home',      icon:'⊞' },
  { id:'catalogue', label:'Catalogue',       short:'Books',     icon:'📚' },
  { id:'loans',     label:'Loans',           short:'Loans',     icon:'⇄'  },
  { id:'learners',  label:'Learners',        short:'Learners',  icon:'👥' },
  { id:'reports',   label:'Reports',         short:'Reports',   icon:'📊' },
  { id:'settings',  label:'Settings',        short:'Settings',  icon:'⚙'  },
];

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <aside className={`flex flex-col bg-slate shrink-0 transition-all duration-300 ease-in-out ${collapsed?'w-16':'w-56'}`} style={{ minHeight:'100%' }}>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed?'justify-center':''}`}>
        <OrbitMark width={collapsed?30:38} dark={true}/>
        {!collapsed && <div>
          <div style={{ fontFamily:'inherit', fontWeight:900, fontSize:15, color:'#F0E5DF', letterSpacing:'-0.5px', lineHeight:1 }}>Orbit</div>
          <div style={{ color:'rgba(240,229,223,0.35)', fontSize:8, letterSpacing:2.5, textTransform:'uppercase', marginTop:3, fontWeight:700 }}>Library</div>
        </div>}
      </div>
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const active = page===item.id;
          return (
            <button key={item.id} onClick={()=>setPage(item.id)} title={collapsed?item.label:undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 ${collapsed?'justify-center':''}`}
              style={{
                fontFamily:'inherit',
                background: active ? 'linear-gradient(135deg,rgba(196,192,251,0.25),rgba(75,142,186,0.35))' : 'transparent',
                color: active ? '#F0E5DF' : 'rgba(240,229,223,0.55)',
                borderLeft: active ? '2px solid #C4C0FB' : '2px solid transparent',
              }}>
              <span className="text-base leading-none shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate text-left">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-2 pb-1 border-t border-white/10 pt-2">
        <button onClick={()=>setPage('learner-portal')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 ${collapsed?'justify-center':''}`}
          style={{
            fontFamily:'inherit',
            background: page==='learner-portal' ? 'rgba(162,159,236,0.18)' : 'transparent',
            color: page==='learner-portal' ? '#C4C0FB' : 'rgba(162,159,236,0.55)',
            borderLeft: page==='learner-portal' ? '2px solid #A29FEC' : '2px solid transparent',
          }}
          title={collapsed?'Learner Portal':undefined}>
          <span className="text-base shrink-0">🎓</span>
          {!collapsed && <span className="truncate">Learner Portal</span>}
        </button>
      </div>
      <button onClick={()=>setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-white/10 text-[rgba(240,229,223,0.4)] hover:text-[#F0E5DF] transition-colors cursor-pointer border-0 bg-transparent"
        style={{ fontFamily:'inherit' }}>
        <span style={{ fontSize:13, fontWeight:700 }}>{collapsed?'›':'‹'}</span>
      </button>
    </aside>
  );
}

// ── Mobile Top Bar ────────────────────────────────────────────────────────────
function MobileTopBar({ page }) {
  const item = [...NAV_ITEMS, { id:'learner-portal', label:'Learner Portal' }].find(n=>n.id===page);
  return (
    <header style={{ background:'#1C2830', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
      <OrbitMark width={28} dark={true}/>
      <div>
        <div style={{ fontWeight:900, fontSize:13, color:'#F0E5DF', letterSpacing:'-0.3px', lineHeight:1 }}>Orbit</div>
        <div style={{ fontWeight:700, fontSize:9, color:'rgba(240,229,223,0.35)', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>{item?.label||'Library'}</div>
      </div>
    </header>
  );
}

// ── Mobile Bottom Tab Bar ─────────────────────────────────────────────────────
const MOBILE_TABS = [
  { id:'dashboard', label:'Home',    icon:'⊞' },
  { id:'catalogue', label:'Books',   icon:'📚' },
  { id:'loans',     label:'Loans',   icon:'⇄'  },
  { id:'learners',  label:'People',  icon:'👥' },
  { id:'settings',  label:'More',    icon:'⚙'  },
];
function MobileBottomNav({ page, setPage }) {
  return (
    <nav style={{ background:'#1C2830', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexShrink:0 }}>
      {MOBILE_TABS.map(tab => {
        const active = page===tab.id || (tab.id==='settings' && ['settings','reports'].includes(page));
        return (
          <button key={tab.id} onClick={()=>setPage(tab.id)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 4px 10px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
              color: active ? '#C4C0FB' : 'rgba(240,229,223,0.38)', transition:'color 0.1s' }}>
            <span style={{ fontSize:20, lineHeight:1 }}>{tab.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, background: active ? 'linear-gradient(135deg,#C4C0FB,#4B8EBA)' : 'none', WebkitBackgroundClip: active ? 'text' : 'unset', WebkitTextFillColor: active ? 'transparent' : 'inherit' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Dashboard Shell ───────────────────────────────────────────────────────────
function DashboardShell({ page, setPage, children, isMobile }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:'#F0E5DF' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      )}
      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {isMobile && <MobileTopBar page={page}/>}
        <main style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding: isMobile ? '16px 16px 8px' : '28px 32px' }}>
          {children}
        </main>
        {isMobile && <MobileBottomNav page={page} setPage={setPage}/>}
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, className='' }) {
  return <div className={`bg-white rounded-2xl border border-slate/10 shadow-sm ${className}`}>{children}</div>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name='?', size=32 }) {
  const initials = (name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
  const palettes = ['#4B8EBA20,#4B8EBA','#F6B93B20,#92680a','#A29FEC20,#4845a0','#22c55e20,#15803d','#ef444420,#b91c1c'];
  const [bg, fg] = palettes[name.charCodeAt(0)%palettes.length].split(',');
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color:fg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:size*0.38, flexShrink:0 }}>{initials}</div>;
}

// ── BookCover ──────────────────────────────────────────────────────────────────
const COVER_PALETTES = [
  ['#4B8EBA','#2E6A90'],['#2C3A47','#141E26'],['#F6B93B','#A86808'],
  ['#A29FEC','#7470BE'],['#3D7A50','#1E4828'],['#8B6347','#5C3C28'],
  ['#C45B5B','#8B2020'],['#4B7EAA','#1C4E7A'],
];
function BookCover({ title='', width=40, height=56 }) {
  const idx = (title.charCodeAt(0)||0) % COVER_PALETTES.length;
  const [c1,c2] = COVER_PALETTES[idx];
  const gid = `bk${idx}${title.length}`;
  return (
    <svg width={width} height={height} viewBox="0 0 40 56" style={{ flexShrink:0, borderRadius:3, display:'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/></linearGradient></defs>
      <rect width="40" height="56" rx="2.5" fill={`url(#${gid})`}/>
      <rect x="3" y="4" width="3" height="48" rx="1" fill="rgba(0,0,0,0.18)"/>
      <rect x="8" y="10" width="24" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
      <rect x="8" y="14" width="18" height="1" rx="0.5" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

Object.assign(window, {
  OrbitMark, Btn, Inp, Sel, StatusChip, Badge, Modal, ToastProvider, useToast,
  DashboardShell, Card, Avatar, BookCover, NAV_ITEMS, MOBILE_TABS
});
