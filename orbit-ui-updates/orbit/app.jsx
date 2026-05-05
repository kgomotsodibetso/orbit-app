// orbit/app.jsx — All pages with responsive layouts

// ── Sample Data ───────────────────────────────────────────────────────────────
const BOOKS_INIT = [
  { id:'b01', title:'Long Walk to Freedom',     author:'Nelson Mandela',      isbn:'978-0316548182', genre:'Biography', copies:3, available:2 },
  { id:'b02', title:'Disgrace',                 author:'J.M. Coetzee',        isbn:'978-0140296204', genre:'Fiction',   copies:2, available:1 },
  { id:'b03', title:'Born a Crime',             author:'Trevor Noah',         isbn:'978-0385687781', genre:'Memoir',    copies:4, available:4 },
  { id:'b04', title:'Things Fall Apart',        author:'Chinua Achebe',       isbn:'978-0385474542', genre:'Fiction',   copies:5, available:3 },
  { id:'b05', title:'To Kill a Mockingbird',    author:'Harper Lee',          isbn:'978-0061935466', genre:'Fiction',   copies:3, available:0 },
  { id:'b06', title:'Cry, the Beloved Country', author:'Alan Paton',          isbn:'978-0743262071', genre:'Fiction',   copies:6, available:5 },
  { id:'b07', title:'Animal Farm',              author:'George Orwell',       isbn:'978-0452284241', genre:'Fiction',   copies:4, available:3 },
  { id:'b08', title:'Macbeth',                  author:'William Shakespeare', isbn:'978-0521294348', genre:'Drama',     copies:8, available:6 },
  { id:'b09', title:'The Kite Runner',          author:'Khaled Hosseini',     isbn:'978-1594631931', genre:'Fiction',   copies:3, available:2 },
  { id:'b10', title:'The Great Gatsby',         author:'F. Scott Fitzgerald', isbn:'978-0743273565', genre:'Fiction',   copies:2, available:1 },
  { id:'b11', title:'The Diary of a Young Girl',author:'Anne Frank',          isbn:'978-0553577129', genre:'Memoir',    copies:2, available:2 },
  { id:'b12', title:'A Raisin in the Sun',      author:'Lorraine Hansberry',  isbn:'978-0679755333', genre:'Drama',     copies:2, available:2 },
];

const LEARNERS_INIT = [
  { id:'l01', name:'Thabo Mokoena',     grade:'Grade 10', email:'thabo.m@orbit.edu',    phone:'071 234 5678', active:true  },
  { id:'l02', name:'Nomsa Dlamini',     grade:'Grade 11', email:'nomsa.d@orbit.edu',    phone:'082 345 6789', active:true  },
  { id:'l03', name:'Sipho Nkosi',       grade:'Grade 9',  email:'sipho.n@orbit.edu',    phone:'073 456 7890', active:true  },
  { id:'l04', name:'Lerato Sithole',    grade:'Grade 12', email:'lerato.s@orbit.edu',   phone:'083 567 8901', active:true  },
  { id:'l05', name:'Amahle Zwane',      grade:'Grade 10', email:'amahle.z@orbit.edu',   phone:'079 678 9012', active:true  },
  { id:'l06', name:'Mandla Khumalo',    grade:'Grade 11', email:'mandla.k@orbit.edu',   phone:'081 789 0123', active:false },
  { id:'l07', name:'Zanele Moyo',       grade:'Grade 8',  email:'zanele.m@orbit.edu',   phone:'072 890 1234', active:true  },
  { id:'l08', name:'Bongani Shabalala', grade:'Grade 12', email:'bongani.s@orbit.edu',  phone:'084 901 2345', active:true  },
];

const LOANS_INIT = [
  { id:'ln01', bookId:'b05', bookTitle:'To Kill a Mockingbird',    learnerId:'l01', learnerName:'Thabo Mokoena',     out:'2026-04-01', due:'2026-04-15', status:'overdue'  },
  { id:'ln02', bookId:'b02', bookTitle:'Disgrace',                  learnerId:'l02', learnerName:'Nomsa Dlamini',     out:'2026-04-10', due:'2026-04-24', status:'active'   },
  { id:'ln03', bookId:'b01', bookTitle:'Long Walk to Freedom',      learnerId:'l04', learnerName:'Lerato Sithole',    out:'2026-04-08', due:'2026-04-22', status:'active'   },
  { id:'ln04', bookId:'b07', bookTitle:'Animal Farm',               learnerId:'l05', learnerName:'Amahle Zwane',      out:'2026-03-28', due:'2026-04-11', status:'overdue'  },
  { id:'ln05', bookId:'b09', bookTitle:'The Kite Runner',           learnerId:'l07', learnerName:'Zanele Moyo',       out:'2026-04-12', due:'2026-04-26', status:'active'   },
  { id:'ln06', bookId:'b04', bookTitle:'Things Fall Apart',         learnerId:'l08', learnerName:'Bongani Shabalala', out:'2026-04-05', due:'2026-04-19', status:'active'   },
  { id:'ln07', bookId:'b06', bookTitle:'Cry, the Beloved Country',  learnerId:'l01', learnerName:'Thabo Mokoena',     out:'2026-03-15', due:'2026-03-29', status:'returned' },
  { id:'ln08', bookId:'b08', bookTitle:'Macbeth',                   learnerId:'l03', learnerName:'Sipho Nkosi',       out:'2026-04-01', due:'2026-04-15', status:'returned' },
];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'});
}
function today()   { return new Date().toISOString().slice(0,10); }
function dueDate() { const d=new Date();d.setDate(d.getDate()+14);return d.toISOString().slice(0,10); }

// ── Page: Login ────────────────────────────────────────────────────────────────
function LoginPage({ setPage, setAuthed }) {
  const [email,setEmail]=React.useState('');
  const [pw,setPw]=React.useState('');
  const [loading,setLoading]=React.useState(false);
  const [err,setErr]=React.useState('');
  const toast=useToast();

  function handleLogin(e){
    e.preventDefault();
    if(!email||!pw){setErr('Please fill in both fields.');return;}
    setLoading(true);
    setTimeout(()=>{setLoading(false);if(pw==='wrong'){setErr('Incorrect email or password.');return;}setErr('');setAuthed(true);},800);
  }

  return (
    <div style={{minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px',background:'#1C2830',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,marginBottom:32}}>
          <OrbitMark width={72} dark={true}/>
          <div style={{textAlign:'center'}}>
            <h1 style={{fontSize:22,fontWeight:900,color:'#F0E5DF',letterSpacing:'-0.5px'}}>Mission Control</h1>
            <p style={{fontSize:13,color:'rgba(240,229,223,0.45)',marginTop:4}}>Orbit Library Management System</p>
          </div>
        </div>
        <div style={{background:'white',borderRadius:24,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',padding:28}}>
          <h2 style={{fontSize:16,fontWeight:800,color:'#2C3A47',marginBottom:20}}>Sign in to your library</h2>
          {err && <div style={{marginBottom:14,padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,fontSize:13,color:'#dc2626'}}>{err}</div>}
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:14}}>
            <Inp label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="librarian@school.co.za" icon="✉" required/>
            <Inp label="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" icon="🔒" required/>
            <div style={{textAlign:'right',marginTop:-6}}>
              <button type="button" onClick={()=>setPage('forgot')} style={{fontSize:12,color:'#4B8EBA',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Forgot password?</button>
            </div>
            <Btn type="submit" loading={loading} disabled={!email||!pw} fullWidth size="lg">Sign In</Btn>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0'}}>
            <div style={{flex:1,height:1,background:'rgba(44,58,71,0.1)'}}/><span style={{fontSize:12,color:'rgba(44,58,71,0.4)',fontWeight:600}}>or</span>
            <div style={{flex:1,height:1,background:'rgba(44,58,71,0.1)'}}/>
          </div>

          <button type="button" onClick={()=>toast('Google sign-in coming soon!','info')}
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'11px 16px',borderRadius:14,border:'1.5px solid rgba(44,58,71,0.15)',background:'white',fontSize:13,fontWeight:700,color:'#2C3A47',cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.5 16.5 18.9 14 24 14c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 9.1 6.3 15.2z"/><path fill="#4CAF50" d="M24 45c4.9 0 9.4-1.9 12.8-4.9l-6.2-5.1C28.7 36.6 26.4 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.5 40.7 16.2 45 24 45z"/><path fill="#1976D2" d="M43.6 20.1H24v8h11.3c-.9 2.4-2.5 4.5-4.6 5.9l6.2 5.1C40.4 36.2 44 31 44 25c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>
          <p style={{textAlign:'center',fontSize:13,color:'rgba(44,58,71,0.5)',marginTop:18}}>New school? <button type="button" onClick={()=>setPage('register')} style={{color:'#4B8EBA',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Create an account</button></p>
        </div>
        <p style={{textAlign:'center',fontSize:11,color:'rgba(240,229,223,0.25)',marginTop:24}}>© {new Date().getFullYear()} Orbit Tech · Built for South African schools</p>
      </div>
    </div>
  );
}

// ── Page: Register ─────────────────────────────────────────────────────────────
function RegisterPage({ setPage }) {
  const [form,setForm]=React.useState({school:'',email:'',pw:'',confirm:''});
  const [loading,setLoading]=React.useState(false);
  const toast=useToast();
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  function submit(e){e.preventDefault();setLoading(true);setTimeout(()=>{setLoading(false);toast('Account created! Check your email.');setPage('login');},1000);}
  return (
    <div style={{minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px',background:'#1C2830',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,marginBottom:32}}>
          <OrbitMark width={64} dark={true}/><h1 style={{fontSize:22,fontWeight:900,color:'#F0E5DF'}}>Create your library</h1>
        </div>
        <div style={{background:'white',borderRadius:24,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',padding:28}}>
          <h2 style={{fontSize:16,fontWeight:800,color:'#2C3A47',marginBottom:20}}>School registration</h2>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <Inp label="School name" value={form.school} onChange={e=>upd('school',e.target.value)} placeholder="Tshiamiso High School" required icon="🏫"/>
            <Inp label="Admin email" type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="admin@school.co.za" required icon="✉"/>
            <Inp label="Password" type="password" value={form.pw} onChange={e=>upd('pw',e.target.value)} placeholder="Min. 8 characters" required icon="🔒"/>
            <Inp label="Confirm password" type="password" value={form.confirm} onChange={e=>upd('confirm',e.target.value)} placeholder="Repeat password" icon="🔒"
              error={form.confirm&&form.pw!==form.confirm?'Passwords do not match':''}/>
            <Btn type="submit" loading={loading} fullWidth size="lg">Create Account</Btn>
          </form>
          <p style={{textAlign:'center',fontSize:13,color:'rgba(44,58,71,0.5)',marginTop:18}}>Already registered? <button type="button" onClick={()=>setPage('login')} style={{color:'#4B8EBA',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}

// ── Page: Forgot Password ──────────────────────────────────────────────────────
function ForgotPage({ setPage }) {
  const [email,setEmail]=React.useState('');
  const [sent,setSent]=React.useState(false);
  const [loading,setLoading]=React.useState(false);
  function submit(e){e.preventDefault();setLoading(true);setTimeout(()=>{setLoading(false);setSent(true);},800);}
  return (
    <div style={{minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px',background:'#1C2830'}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:32}}><OrbitMark width={64} dark={true}/></div>
        <div style={{background:'white',borderRadius:24,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',padding:28}}>
          {!sent ? <>
            <h2 style={{fontSize:16,fontWeight:800,color:'#2C3A47',marginBottom:6}}>Reset your password</h2>
            <p style={{fontSize:13,color:'rgba(44,58,71,0.55)',marginBottom:20}}>We'll send a reset link to your email.</p>
            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
              <Inp label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="librarian@school.co.za" required icon="✉"/>
              <Btn type="submit" loading={loading} disabled={!email} fullWidth size="lg">Send Reset Link</Btn>
            </form>
          </> : <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:12,padding:'12px 0'}}>
            <div style={{width:56,height:56,background:'#f0fdf4',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>✓</div>
            <h2 style={{fontSize:16,fontWeight:800,color:'#2C3A47'}}>Check your email</h2>
            <p style={{fontSize:13,color:'rgba(44,58,71,0.55)'}}>Reset link sent to <strong>{email}</strong>. Expires in 15 minutes.</p>
          </div>}
          <button type="button" onClick={()=>setPage('login')} style={{marginTop:18,fontSize:13,color:'rgba(44,58,71,0.5)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>← Back to sign in</button>
        </div>
      </div>
    </div>
  );
}

// ── Page: Dashboard ────────────────────────────────────────────────────────────
function DashboardPage({ loans, setPage, isMobile }) {
  const active  = loans.filter(l=>l.status==='active').length;
  const overdue = loans.filter(l=>l.status==='overdue').length;
  const recent  = [...loans].slice(0,6);

  const stats = [
    { label:'Total Books',  value:'1,204', icon:'📚', bg:'rgba(196,192,251,0.15)', val_col:'#2C3A47' },
    { label:'Active Loans', value:active,  icon:'⇄',  bg:'rgba(75,142,186,0.12)', val_col:'#2C3A47' },
    { label:'Overdue',      value:overdue, icon:'⚠',  bg:'rgba(239,68,68,0.08)', val_col:overdue>0?'#dc2626':'#2C3A47' },
    { label:'Learners',     value:'342',   icon:'👥', bg:'rgba(246,185,59,0.12)', val_col:'#2C3A47' },
  ];

  return (
    <div style={{paddingBottom:24}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:isMobile?20:28,fontWeight:900,color:'#2C3A47',letterSpacing:'-0.5px'}}>Mission Control</h1>
        <p style={{fontSize:13,color:'rgba(44,58,71,0.5)',marginTop:3}}>
          {new Date().toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </p>
      </div>

      {/* Quick actions */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <Btn size="sm" onClick={()=>setPage('loans')}>+ Check Out</Btn>
        <Btn size="sm" variant="secondary" onClick={()=>setPage('loans')}>↩ Return Book</Btn>
      </div>

      {/* Stat cards — 2-col on mobile, 4 on desktop */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:'white',borderRadius:18,padding:isMobile?'14px 14px':'18px 20px',border:'1px solid rgba(44,58,71,0.08)',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
            <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize:isMobile?24:30,fontWeight:900,color:s.val_col,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:'rgba(44,58,71,0.5)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue banner */}
      {overdue>0 && (
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:16,padding:'14px 18px',display:'flex',flexDirection:isMobile?'column':'row',alignItems:isMobile?'flex-start':'center',justifyContent:'space-between',gap:12,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:18,color:'#dc2626',flexShrink:0}}>⚠</span>
            <p style={{fontSize:13,fontWeight:700,color:'#dc2626'}}>{overdue} book{overdue>1?'s are':' is'} overdue · SMS reminders will be sent tonight</p>
          </div>
          <Btn size="sm" variant="danger" onClick={()=>setPage('loans')}>View Overdue</Btn>
        </div>
      )}

      {/* Recent activity */}
      <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(44,58,71,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:14,fontWeight:800,color:'#2C3A47'}}>Recent Activity</span>
          <button type="button" onClick={()=>setPage('loans')} style={{fontSize:12,color:'#4B8EBA',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>View all →</button>
        </div>
        {recent.map((loan,i)=>(
          <div key={loan.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<recent.length-1?'1px solid rgba(44,58,71,0.05)':'none'}}>
            <BookCover title={loan.bookTitle} width={32} height={44}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:700,color:'#2C3A47',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{loan.bookTitle}</p>
              <p style={{fontSize:11,color:'rgba(44,58,71,0.5)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{loan.learnerName} · Due {fmtDate(loan.due)}</p>
            </div>
            <StatusChip status={loan.status}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page: Catalogue ────────────────────────────────────────────────────────────
function CataloguePage({ books, setBooks, isMobile }) {
  const [q,setQ]=React.useState('');
  const [genre,setGenre]=React.useState('All');
  const [showAdd,setShowAdd]=React.useState(false);
  const [form,setForm]=React.useState({title:'',author:'',isbn:'',genre:'Fiction',copies:'1'});
  const [detail,setDetail]=React.useState(null);
  const toast=useToast();
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));

  const genres=['All',...Array.from(new Set(books.map(b=>b.genre)))];
  const filtered=books.filter(b=>{
    const mq=!q||b.title.toLowerCase().includes(q.toLowerCase())||b.author.toLowerCase().includes(q.toLowerCase())||b.isbn.includes(q);
    return mq&&(genre==='All'||b.genre===genre);
  });

  function addBook(e){
    e.preventDefault();
    setBooks(bs=>[...bs,{id:'b'+Date.now(),...form,copies:+form.copies,available:+form.copies}]);
    toast(`"${form.title}" added to catalogue`);
    setShowAdd(false);setForm({title:'',author:'',isbn:'',genre:'Fiction',copies:'1'});
  }

  return (
    <div style={{paddingBottom:24}}>
      <div style={{display:'flex',alignItems:isMobile?'flex-start':'center',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:12,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:isMobile?20:26,fontWeight:900,color:'#2C3A47'}}>Catalogue</h1>
          <p style={{fontSize:12,color:'rgba(44,58,71,0.5)',marginTop:3}}>{books.length} books · {books.reduce((a,b)=>a+b.available,0)} available</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Book</Btn>
      </div>

      {/* Search */}
      <div style={{position:'relative',marginBottom:12}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(44,58,71,0.35)',fontSize:14}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by title, author or ISBN…"
          style={{width:'100%',borderRadius:14,border:'1.5px solid rgba(44,58,71,0.15)',background:'white',paddingLeft:38,paddingRight:14,paddingTop:10,paddingBottom:10,fontSize:13,fontFamily:'inherit',color:'#2C3A47',outline:'none'}}
          onFocus={e=>e.target.style.borderColor='#4B8EBA'}
          onBlur={e=>e.target.style.borderColor='rgba(44,58,71,0.15)'}/>
      </div>

      {/* Genre pills */}
      <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap'}}>
        {genres.map(g=>(
          <button key={g} type="button" onClick={()=>setGenre(g)}
            style={{padding:'6px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:`1.5px solid ${genre===g?'#2C3A47':'rgba(44,58,71,0.15)'}`,
              background:genre===g?'#2C3A47':'white',color:genre===g?'#F0E5DF':'rgba(44,58,71,0.65)',cursor:'pointer',fontFamily:'inherit',transition:'all 0.1s'}}>
            {g}
          </button>
        ))}
      </div>

      {/* Book grid — 1 col mobile, 2 tablet, 3 desktop */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {filtered.map(b=>(
          <div key={b.id} onClick={()=>setDetail(b)}
            style={{background:'white',borderRadius:16,border:'1.5px solid rgba(44,58,71,0.08)',padding:'14px 16px',display:'flex',gap:14,cursor:'pointer',transition:'box-shadow 0.15s,border-color 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';e.currentTarget.style.borderColor='rgba(75,142,186,0.3)';}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='rgba(44,58,71,0.08)';}}>
            <BookCover title={b.title} width={44} height={62}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:800,color:'#2C3A47',lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{b.title}</p>
              <p style={{fontSize:12,color:'rgba(44,58,71,0.55)',marginTop:2}}>{b.author}</p>
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                <Badge variant={b.available>0?'steel':'danger'}>{b.available>0?`${b.available}/${b.copies} avail.`:'All out'}</Badge>
                <Badge variant="neutral">{b.genre}</Badge>
              </div>
              <p style={{fontSize:10,color:'rgba(44,58,71,0.3)',marginTop:5,fontFamily:'monospace'}}>{b.isbn}</p>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px 0',color:'rgba(44,58,71,0.4)',fontSize:14}}>No books found matching "{q}"</div>}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Book">
        <form onSubmit={addBook} style={{display:'flex',flexDirection:'column',gap:14}}>
          <Inp label="Title" value={form.title} onChange={e=>upd('title',e.target.value)} placeholder="Long Walk to Freedom" required/>
          <Inp label="Author" value={form.author} onChange={e=>upd('author',e.target.value)} placeholder="Nelson Mandela" required/>
          <Inp label="ISBN" value={form.isbn} onChange={e=>upd('isbn',e.target.value)} placeholder="978-0000000000"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Sel label="Genre" value={form.genre} onChange={e=>upd('genre',e.target.value)}>
              {['Fiction','Non-Fiction','Biography','Memoir','Drama','Poetry','Reference'].map(g=><option key={g}>{g}</option>)}
            </Sel>
            <Inp label="Copies" type="number" value={form.copies} onChange={e=>upd('copies',e.target.value)} required/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,paddingTop:4}}>
            <Btn type="button" variant="secondary" fullWidth onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn type="submit" fullWidth disabled={!form.title||!form.author}>Add Book</Btn>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={()=>setDetail(null)} title={detail?.title||''}>
        {detail && <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'flex',gap:16}}>
            <BookCover title={detail.title} width={60} height={84}/>
            <div><p style={{fontWeight:800,color:'#2C3A47',fontSize:15}}>{detail.title}</p><p style={{fontSize:13,color:'rgba(44,58,71,0.55)',marginTop:2}}>{detail.author}</p><p style={{fontSize:11,color:'rgba(44,58,71,0.35)',marginTop:3,fontFamily:'monospace'}}>{detail.isbn}</p></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[{l:'Genre',v:detail.genre},{l:'Total Copies',v:detail.copies},{l:'Available',v:detail.available}].map(s=>(
              <div key={s.l} style={{background:'rgba(44,58,71,0.04)',borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:900,color:'#2C3A47'}}>{s.v}</div>
                <div style={{fontSize:11,color:'rgba(44,58,71,0.5)',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          <Btn fullWidth onClick={()=>setDetail(null)}>Close</Btn>
        </div>}
      </Modal>
    </div>
  );
}

// ── Page: Loans ────────────────────────────────────────────────────────────────
function LoansPage({ loans, setLoans, books, learners, isMobile }) {
  const [tab,setTab]=React.useState('all');
  const [q,setQ]=React.useState('');
  const [showCheckout,setShowCheckout]=React.useState(false);
  const [showReturn,setShowReturn]=React.useState(null);
  const [co,setCo]=React.useState({learnerId:'',bookId:''});
  const toast=useToast();

  const TABS=[
    {id:'all',label:'All',count:loans.length},
    {id:'active',label:'Active',count:loans.filter(l=>l.status==='active').length},
    {id:'overdue',label:'Overdue',count:loans.filter(l=>l.status==='overdue').length},
    {id:'returned',label:'Returned',count:loans.filter(l=>l.status==='returned').length},
  ];
  const filtered=loans.filter(l=>(tab==='all'||l.status===tab)&&(!q||l.bookTitle.toLowerCase().includes(q.toLowerCase())||l.learnerName.toLowerCase().includes(q.toLowerCase())));

  function doCheckout(e){
    e.preventDefault();
    const book=books.find(b=>b.id===co.bookId),learner=learners.find(l=>l.id===co.learnerId);
    if(!book||!learner)return;
    setLoans(ls=>[{id:'ln'+Date.now(),bookId:book.id,bookTitle:book.title,learnerId:learner.id,learnerName:learner.name,out:today(),due:dueDate(),status:'active'},...ls]);
    toast(`"${book.title}" checked out to ${learner.name}`);
    setShowCheckout(false);setCo({learnerId:'',bookId:''});
  }
  function doReturn(loan){setLoans(ls=>ls.map(l=>l.id===loan.id?{...l,status:'returned'}:l));toast(`"${loan.bookTitle}" returned`);setShowReturn(null);}

  return (
    <div style={{paddingBottom:24}}>
      <div style={{display:'flex',alignItems:isMobile?'flex-start':'center',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:12,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:isMobile?20:26,fontWeight:900,color:'#2C3A47'}}>Loans</h1>
          <p style={{fontSize:12,color:'rgba(44,58,71,0.5)',marginTop:3}}>{loans.filter(l=>l.status!=='returned').length} active · {loans.filter(l=>l.status==='overdue').length} overdue</p>
        </div>
        <Btn size="sm" onClick={()=>setShowCheckout(true)}>+ Check Out</Btn>
      </div>

      {/* Status tabs */}
      <div style={{display:'flex',gap:4,marginBottom:14,background:'white',borderRadius:14,border:'1px solid rgba(44,58,71,0.1)',padding:4,width:'fit-content',flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t.id} type="button" onClick={()=>setTab(t.id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:10,fontSize:12,fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit',transition:'all 0.1s',
              background:tab===t.id?'#2C3A47':'transparent',color:tab===t.id?'#F0E5DF':'rgba(44,58,71,0.55)'}}>
            {t.label}
            {t.count>0&&<span style={{padding:'1px 6px',borderRadius:99,fontSize:10,background:tab===t.id?'rgba(255,255,255,0.2)':'rgba(44,58,71,0.08)'}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{position:'relative',marginBottom:14,maxWidth:isMobile?'100%':360}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(44,58,71,0.35)',fontSize:14}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search loans…"
          style={{width:'100%',borderRadius:14,border:'1.5px solid rgba(44,58,71,0.15)',background:'white',paddingLeft:38,paddingRight:14,paddingTop:10,paddingBottom:10,fontSize:13,fontFamily:'inherit',color:'#2C3A47',outline:'none'}}/>
      </div>

      {/* Loan list (card style on mobile, table on desktop) */}
      <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',overflow:'hidden'}}>
        {isMobile ? (
          // Mobile: card list
          filtered.map((loan,i)=>(
            <div key={loan.id} style={{padding:'14px 16px',borderBottom:i<filtered.length-1?'1px solid rgba(44,58,71,0.05)':'none'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <BookCover title={loan.bookTitle} width={36} height={50}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:800,color:'#2C3A47',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{loan.bookTitle}</p>
                  <p style={{fontSize:12,color:'rgba(44,58,71,0.6)',marginTop:2}}>{loan.learnerName}</p>
                  <p style={{fontSize:11,color:loan.status==='overdue'?'#dc2626':'rgba(44,58,71,0.45)',marginTop:2,fontWeight:loan.status==='overdue'?700:500}}>Due {fmtDate(loan.due)}</p>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                    <StatusChip status={loan.status}/>
                    {loan.status!=='returned'&&<Btn size="sm" variant="secondary" onClick={()=>setShowReturn(loan)}>Return</Btn>}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Desktop: table
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr style={{borderBottom:'1px solid rgba(44,58,71,0.08)'}}>
                {['Book','Learner','Checked Out','Due Date','Status',''].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'12px 18px',fontSize:10,fontWeight:800,color:'rgba(44,58,71,0.4)',letterSpacing:1,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((loan,i)=>(
                  <tr key={loan.id} style={{borderBottom:i<filtered.length-1?'1px solid rgba(44,58,71,0.05)':'none'}}>
                    <td style={{padding:'12px 18px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <BookCover title={loan.bookTitle} width={28} height={38}/>
                        <span style={{fontWeight:700,color:'#2C3A47',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>{loan.bookTitle}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 18px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <Avatar name={loan.learnerName} size={28}/>
                        <span style={{color:'rgba(44,58,71,0.8)'}}>{loan.learnerName}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 18px',color:'rgba(44,58,71,0.5)'}}>{fmtDate(loan.out)}</td>
                    <td style={{padding:'12px 18px',color:loan.status==='overdue'?'#dc2626':'rgba(44,58,71,0.5)',fontWeight:loan.status==='overdue'?700:400}}>{fmtDate(loan.due)}</td>
                    <td style={{padding:'12px 18px'}}><StatusChip status={loan.status}/></td>
                    <td style={{padding:'12px 18px'}}>
                      {loan.status!=='returned'&&<Btn size="sm" variant="secondary" onClick={()=>setShowReturn(loan)}>Return</Btn>}
                    </td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan="6" style={{textAlign:'center',padding:'40px 0',color:'rgba(44,58,71,0.4)'}}>No loans found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {isMobile&&filtered.length===0&&<p style={{textAlign:'center',padding:'40px 16px',color:'rgba(44,58,71,0.4)',fontSize:13}}>No loans found</p>}
      </div>

      <Modal open={showCheckout} onClose={()=>setShowCheckout(false)} title="Check Out Book">
        <form onSubmit={doCheckout} style={{display:'flex',flexDirection:'column',gap:14}}>
          <Sel label="Learner" value={co.learnerId} onChange={e=>setCo(c=>({...c,learnerId:e.target.value}))}>
            <option value="">Select learner…</option>
            {learners.filter(l=>l.active).map(l=><option key={l.id} value={l.id}>{l.name} — {l.grade}</option>)}
          </Sel>
          <Sel label="Book" value={co.bookId} onChange={e=>setCo(c=>({...c,bookId:e.target.value}))}>
            <option value="">Select book…</option>
            {books.filter(b=>b.available>0).map(b=><option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>)}
          </Sel>
          <div style={{background:'rgba(240,229,223,0.6)',borderRadius:12,padding:'10px 14px',fontSize:13,color:'rgba(44,58,71,0.65)'}}>
            <strong>Due date:</strong> {fmtDate(dueDate())} (14 days)
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Btn type="button" variant="secondary" fullWidth onClick={()=>setShowCheckout(false)}>Cancel</Btn>
            <Btn type="submit" fullWidth disabled={!co.learnerId||!co.bookId}>Check Out</Btn>
          </div>
        </form>
      </Modal>

      <Modal open={!!showReturn} onClose={()=>setShowReturn(null)} title="Return Book">
        {showReturn&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',gap:14,padding:'14px',background:'rgba(240,229,223,0.5)',borderRadius:14}}>
            <BookCover title={showReturn.bookTitle} width={44} height={62}/>
            <div><p style={{fontWeight:800,color:'#2C3A47'}}>{showReturn.bookTitle}</p><p style={{fontSize:13,color:'rgba(44,58,71,0.55)',marginTop:2}}>Borrowed by {showReturn.learnerName}</p><p style={{fontSize:12,color:'rgba(44,58,71,0.4)',marginTop:2}}>Due: {fmtDate(showReturn.due)}</p></div>
          </div>
          <p style={{fontSize:13,color:'rgba(44,58,71,0.65)'}}>Confirm this book has been returned?</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Btn variant="secondary" fullWidth onClick={()=>setShowReturn(null)}>Cancel</Btn>
            <Btn fullWidth onClick={()=>doReturn(showReturn)}>Confirm Return</Btn>
          </div>
        </div>}
      </Modal>
    </div>
  );
}

// ── Page: Learners ─────────────────────────────────────────────────────────────
function LearnersPage({ learners, setLearners, loans, isMobile }) {
  const [q,setQ]=React.useState('');
  const [showAdd,setShowAdd]=React.useState(false);
  const [detail,setDetail]=React.useState(null);
  const [form,setForm]=React.useState({name:'',grade:'Grade 8',email:'',phone:''});
  const toast=useToast();
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const filtered=learners.filter(l=>!q||l.name.toLowerCase().includes(q.toLowerCase())||l.email.toLowerCase().includes(q.toLowerCase()));
  const getLoanCount=id=>loans.filter(l=>l.learnerId===id&&l.status!=='returned').length;
  function addLearner(e){e.preventDefault();setLearners(ls=>[...ls,{id:'l'+Date.now(),...form,active:true}]);toast(`${form.name} added`);setShowAdd(false);setForm({name:'',grade:'Grade 8',email:'',phone:''});}

  return (
    <div style={{paddingBottom:24}}>
      <div style={{display:'flex',alignItems:isMobile?'flex-start':'center',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:12,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:isMobile?20:26,fontWeight:900,color:'#2C3A47'}}>Learners</h1>
          <p style={{fontSize:12,color:'rgba(44,58,71,0.5)',marginTop:3}}>{learners.filter(l=>l.active).length} active learners</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Learner</Btn>
      </div>
      <div style={{position:'relative',marginBottom:14}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(44,58,71,0.35)',fontSize:14}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or email…"
          style={{width:'100%',borderRadius:14,border:'1.5px solid rgba(44,58,71,0.15)',background:'white',paddingLeft:38,paddingRight:14,paddingTop:10,paddingBottom:10,fontSize:13,fontFamily:'inherit',color:'#2C3A47',outline:'none'}}/>
      </div>
      <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',overflow:'hidden'}}>
        {filtered.map((l,i)=>{
          const cnt=getLoanCount(l.id);
          return (
            <div key={l.id} onClick={()=>setDetail(l)}
              style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<filtered.length-1?'1px solid rgba(44,58,71,0.05)':'none',cursor:'pointer',transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(240,229,223,0.4)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Avatar name={l.name} size={40}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#2C3A47'}}>{l.name}</p>
                  {!l.active&&<Badge variant="neutral">Inactive</Badge>}
                </div>
                <p style={{fontSize:12,color:'rgba(44,58,71,0.5)',marginTop:2}}>{l.grade} · {l.email}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                {cnt>0&&<Badge variant="golden">{cnt} out</Badge>}
                <span style={{color:'rgba(44,58,71,0.2)',fontSize:16}}>›</span>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<p style={{textAlign:'center',padding:'40px 0',color:'rgba(44,58,71,0.4)',fontSize:13}}>No learners found</p>}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Learner">
        <form onSubmit={addLearner} style={{display:'flex',flexDirection:'column',gap:14}}>
          <Inp label="Full name" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Thabo Mokoena" required/>
          <Sel label="Grade" value={form.grade} onChange={e=>upd('grade',e.target.value)}>
            {['Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g=><option key={g}>{g}</option>)}
          </Sel>
          <Inp label="Email" type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="thabo@school.co.za"/>
          <Inp label="Phone" value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="071 234 5678"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Btn type="button" variant="secondary" fullWidth onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn type="submit" fullWidth disabled={!form.name}>Add Learner</Btn>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={()=>setDetail(null)} title={detail?.name||''} width="max-w-lg">
        {detail&&(()=>{
          const myLoans=loans.filter(l=>l.learnerId===detail.id);
          return <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:'rgba(240,229,223,0.5)',borderRadius:14}}>
              <Avatar name={detail.name} size={52}/>
              <div>
                <p style={{fontWeight:900,color:'#2C3A47',fontSize:16}}>{detail.name}</p>
                <p style={{fontSize:13,color:'rgba(44,58,71,0.55)',marginTop:2}}>{detail.grade}</p>
                <p style={{fontSize:12,color:'rgba(44,58,71,0.4)',marginTop:2}}>{detail.email}{detail.phone?` · ${detail.phone}`:''}</p>
              </div>
            </div>
            <div>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'rgba(44,58,71,0.4)',marginBottom:10}}>Loan History ({myLoans.length})</p>
              {myLoans.length===0?<p style={{fontSize:13,color:'rgba(44,58,71,0.4)',textAlign:'center',padding:'16px 0'}}>No loans on record</p>:
                myLoans.map((loan,i)=>(
                  <div key={loan.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<myLoans.length-1?'1px solid rgba(44,58,71,0.06)':'none'}}>
                    <div><p style={{fontSize:13,fontWeight:700,color:'#2C3A47'}}>{loan.bookTitle}</p><p style={{fontSize:11,color:'rgba(44,58,71,0.45)',marginTop:1}}>Due {fmtDate(loan.due)}</p></div>
                    <StatusChip status={loan.status}/>
                  </div>
                ))
              }
            </div>
            <Btn fullWidth variant="secondary" onClick={()=>setDetail(null)}>Close</Btn>
          </div>;
        })()}
      </Modal>
    </div>
  );
}

// ── Page: Reports ──────────────────────────────────────────────────────────────
function ReportsPage({ loans, books, isMobile }) {
  const months=['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
  const data=[12,18,9,24,31,28,loans.filter(l=>l.status!=='returned').length+4];
  const maxVal=Math.max(...data);
  const genres={};books.forEach(b=>{genres[b.genre]=(genres[b.genre]||0)+b.copies;});
  const topGenres=Object.entries(genres).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxG=Math.max(...topGenres.map(g=>g[1]));

  return (
    <div style={{paddingBottom:24}}>
      <div style={{display:'flex',alignItems:isMobile?'flex-start':'center',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:12,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:isMobile?20:26,fontWeight:900,color:'#2C3A47'}}>Reports</h1>
          <p style={{fontSize:12,color:'rgba(44,58,71,0.5)',marginTop:3}}>Library analytics</p>
        </div>
        <Btn variant="secondary" size="sm">Export CSV</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:12,marginBottom:18}}>
        {[{l:'Total Loans (YTD)',v:loans.length+107,c:'#4B8EBA'},{l:'Books in Catalogue',v:books.length,c:'#2C3A47'},{l:'Avg. Loan Period',v:'11 days',c:'#2C3A47'},{l:'Return Rate',v:'94%',c:'#16a34a'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:16,padding:'16px',border:'1px solid rgba(44,58,71,0.08)'}}>
            <div style={{fontSize:isMobile?22:28,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,fontWeight:600,color:'rgba(44,58,71,0.5)',marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'2fr 1fr',gap:14,marginBottom:14}}>
        <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',padding:'20px'}}>
          <p style={{fontSize:13,fontWeight:800,color:'#2C3A47',marginBottom:18}}>Loans per Month</p>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:130}}>
            {data.map((val,i)=>(
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
                <span style={{fontSize:10,fontWeight:700,color:'rgba(44,58,71,0.55)'}}>{val}</span>
                <div style={{width:'100%',borderRadius:'6px 6px 0 0',background:i===data.length-1?'linear-gradient(180deg,#C4C0FB,#4B8EBA)':'#E5DDD6',height:`${(val/maxVal)*100}px`,transition:'height 0.4s ease'}}/>
                <span style={{fontSize:10,color:'rgba(44,58,71,0.4)'}}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',padding:'20px'}}>
          <p style={{fontSize:13,fontWeight:800,color:'#2C3A47',marginBottom:16}}>By Genre</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {topGenres.map(([g,count])=>(
              <div key={g}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{fontWeight:700,color:'#2C3A47'}}>{g}</span>
                  <span style={{color:'rgba(44,58,71,0.45)'}}>{count}</span>
                </div>
                <div style={{height:6,background:'rgba(44,58,71,0.08)',borderRadius:3}}>
                  <div style={{height:6,borderRadius:3,background:'linear-gradient(90deg,#C4C0FB,#4B8EBA)',width:`${(count/maxG)*100}%`,transition:'width 0.5s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:'white',borderRadius:18,border:'1px solid rgba(44,58,71,0.08)',overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(44,58,71,0.07)'}}><span style={{fontSize:14,fontWeight:800,color:'#2C3A47'}}>Overdue Books</span></div>
        {loans.filter(l=>l.status==='overdue').length===0
          ? <p style={{textAlign:'center',padding:'32px',fontSize:13,color:'rgba(44,58,71,0.4)'}}>No overdue books 🎉</p>
          : loans.filter(l=>l.status==='overdue').map((l,i,arr)=>(
            <div key={l.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',borderBottom:i<arr.length-1?'1px solid rgba(44,58,71,0.05)':'none'}}>
              <BookCover title={l.bookTitle} width={28} height={38}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:'#2C3A47',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.bookTitle}</p>
                <p style={{fontSize:11,color:'rgba(44,58,71,0.5)',marginTop:1}}>{l.learnerName}</p>
              </div>
              <p style={{fontSize:12,fontWeight:700,color:'#dc2626',flexShrink:0}}>Due {fmtDate(l.due)}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Avatar Builder ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg:'#4B8EBA', fg:'white', name:'Steel'    },
  { bg:'#2C3A47', fg:'#F0E5DF', name:'Slate'  },
  { bg:'#F6B93B', fg:'#2C3A47', name:'Golden' },
  { bg:'#A29FEC', fg:'white', name:'Lavender' },
  { bg:'#22c55e', fg:'white', name:'Green'    },
  { bg:'#ef4444', fg:'white', name:'Red'      },
  { bg:'#8B5CF6', fg:'white', name:'Purple'   },
  { bg:'#F0E5DF', fg:'#2C3A47', name:'Cream'  },
];

function AvatarPicker({ initials, color, setColor, onUpload }) {
  const [open, setOpen] = React.useState(false);
  const fileRef = React.useRef();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
      {/* Current avatar */}
      <div style={{ position:'relative', cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
        <div style={{ width:88, height:88, borderRadius:'50%', background:color.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:color.fg, border:'3px solid white', boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}>{initials}</div>
        <div style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'#2C3A47', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'white', border:'2px solid white' }}>✎</div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <Btn size="sm" variant="secondary" onClick={()=>setOpen(o=>!o)}>Change Colour</Btn>
        <Btn size="sm" variant="secondary" onClick={()=>fileRef.current?.click()}>Upload Photo</Btn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={()=>onUpload&&onUpload()}/>
      </div>
      {open && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'14px', background:'white', borderRadius:16, border:'1px solid rgba(44,58,71,0.1)', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'100%', maxWidth:280 }}>
          {AVATAR_COLORS.map(c=>(
            <button key={c.name} type="button" onClick={()=>{ setColor(c); setOpen(false); }}
              style={{ width:'100%', aspectRatio:'1', borderRadius:'50%', background:c.bg, border:color.name===c.name?'3px solid #2C3A47':'2px solid rgba(44,58,71,0.1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:c.fg, transition:'transform 0.1s' }}
              title={c.name}>
              {initials}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({ isMobile }) {
  const [tab, setTab] = React.useState('profile');
  const toast = useToast();

  // Profile state
  const [profile, setProfile] = React.useState({
    firstName:'Naledi', lastName:'Dube', role:'Head Librarian', email:'naledi.dube@tshiamiso.edu.za',
    phone:'082 456 7890', bio:'Passionate about reading and connecting learners with books. Managing the Tshiamiso library since 2021.',
    avatarColor: AVATAR_COLORS[0],
  });
  const initials = (profile.firstName[0]||'')+(profile.lastName[0]||'');
  const updP = (k,v) => setProfile(p=>({...p,[k]:v}));

  // School state
  const [school, setSchool] = React.useState({
    name:'Tshiamiso High School', province:'Gauteng', type:'Public', phase:'Secondary',
    email:'admin@tshiamiso.edu.za', phone:'011 234 5678', address:'14 Rietfontein Rd, Pretoria, 0084',
    website:'www.tshiamiso.edu.za', loanDays:'14', maxBooks:'3', finePerDay:'0',
    openTime:'07:30', closeTime:'15:30',
  });
  const updS = (k,v) => setSchool(s=>({...s,[k]:v}));

  // Notifications state
  const [notifs, setNotifs] = React.useState({
    smsOverdue:true, smsReminder:true, emailSummary:true, emailNew:false,
    newBookAlert:false, overdueReport:true, lowStockAlert:false, returnConfirm:true,
  });
  const updN = (k,v) => setNotifs(n=>({...n,[k]:v}));

  // Appearance state
  const [appear, setAppear] = React.useState({
    accentColor:'steel', dateFormat:'dd/mm/yyyy', language:'English', densityMode:'comfortable',
    darkSidebar:true,
  });
  const updA = (k,v) => setAppear(a=>({...a,[k]:v}));

  // Team state
  const [team, setTeam] = React.useState([
    { id:'t1', name:'Naledi Dube',   role:'Head Librarian', email:'naledi.dube@tshiamiso.edu.za',  status:'active',  last:'Today'       },
    { id:'t2', name:'Sipho Khumalo', role:'Librarian',      email:'sipho.k@tshiamiso.edu.za',      status:'active',  last:'Yesterday'   },
    { id:'t3', name:'Amara Osei',    role:'Volunteer',      email:'amara.o@tshiamiso.edu.za',       status:'pending', last:'Never'       },
  ]);
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole]   = React.useState('Librarian');

  const TABS = [
    { id:'profile',      label:'Profile',       icon:'👤' },
    { id:'school',       label:'School',        icon:'🏫' },
    { id:'notifications',label:'Notifications', icon:'🔔' },
    { id:'appearance',   label:'Appearance',    icon:'🎨' },
    { id:'team',         label:'Team',          icon:'👥' },
  ];

  const Toggle = ({ value, onChange }) => (
    <button type="button" onClick={()=>onChange(!value)}
      style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', padding:2, flexShrink:0, background:value?'linear-gradient(135deg,#C4C0FB,#4B8EBA)':'rgba(44,58,71,0.18)', transition:'background 0.15s' }}>
      <span style={{ display:'block', width:20, height:20, borderRadius:'50%', background:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transform:value?'translateX(20px)':'translateX(0)', transition:'transform 0.15s' }}/>
    </button>
  );

  const NotifRow = ({ k, label, desc }) => (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, padding:'14px 0', borderBottom:'1px solid rgba(44,58,71,0.06)' }}>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47' }}>{label}</p>
        <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:2 }}>{desc}</p>
      </div>
      <Toggle value={notifs[k]} onChange={v=>{ updN(k,v); toast(v?'Enabled':'Disabled'); }}/>
    </div>
  );

  return (
    <div style={{ paddingBottom:24 }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:isMobile?20:26, fontWeight:900, color:'#2C3A47' }}>Settings</h1>
        <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:3 }}>Manage your profile, school, and preferences</p>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'white', borderRadius:14, border:'1px solid rgba(44,58,71,0.1)', padding:4, overflowX:'auto', width:'fit-content', maxWidth:'100%' }}>
        {TABS.map(t=>(
          <button key={t.id} type="button" onClick={()=>setTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
              background:tab===t.id?'#2C3A47':'transparent', color:tab===t.id?'#F0E5DF':'rgba(44,58,71,0.55)', transition:'all 0.1s' }}>
            <span>{t.icon}</span>{!isMobile&&t.label}
          </button>
        ))}
      </div>

      {/* ════ PROFILE ════ */}
      {tab==='profile' && (
        <div style={{ display:'flex', flexDirection:isMobile?'column':'row', gap:20, alignItems:'flex-start', maxWidth:760 }}>
          {/* Avatar card */}
          <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'28px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:0, width:isMobile?'100%':220, flexShrink:0 }}>
            <AvatarPicker initials={initials} color={profile.avatarColor} setColor={c=>updP('avatarColor',c)} onUpload={()=>toast('Photo upload coming soon — using avatar colour for now','info')}/>
            <div style={{ textAlign:'center', marginTop:16 }}>
              <p style={{ fontSize:15, fontWeight:900, color:'#2C3A47' }}>{profile.firstName} {profile.lastName}</p>
              <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:2 }}>{profile.role}</p>
              <div style={{ marginTop:8 }}><Badge variant="golden">Administrator</Badge></div>
            </div>
            <div style={{ width:'100%', height:1, background:'rgba(44,58,71,0.07)', margin:'16px 0' }}/>
            <div style={{ width:'100%', fontSize:12, color:'rgba(44,58,71,0.5)', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}><span>✉</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.email}</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}><span>📞</span><span>{profile.phone}</span></div>
            </div>
          </div>

          {/* Profile form */}
          <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'24px', flex:1 }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#2C3A47', marginBottom:18 }}>Personal Information</h2>
            <form onSubmit={e=>{e.preventDefault();toast('Profile saved');}} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Inp label="First Name" value={profile.firstName} onChange={e=>updP('firstName',e.target.value)} required/>
                <Inp label="Last Name"  value={profile.lastName}  onChange={e=>updP('lastName',e.target.value)}  required/>
              </div>
              <Inp label="Job Title / Role" value={profile.role} onChange={e=>updP('role',e.target.value)} placeholder="Head Librarian"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Inp label="Email Address" type="email" value={profile.email} onChange={e=>updP('email',e.target.value)} required/>
                <Inp label="Phone Number"  value={profile.phone} onChange={e=>updP('phone',e.target.value)}/>
              </div>
              {/* Bio */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:13, fontWeight:700, color:'#2C3A47' }}>Bio</label>
                <textarea value={profile.bio} onChange={e=>updP('bio',e.target.value)} placeholder="Tell us about yourself…" rows={3}
                  style={{ width:'100%', borderRadius:14, border:'1.5px solid rgba(44,58,71,0.18)', padding:'10px 14px', fontSize:13, fontFamily:'inherit', color:'#2C3A47', resize:'vertical', outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='#4B8EBA'} onBlur={e=>e.target.style.borderColor='rgba(44,58,71,0.18)'}/>
                <p style={{ fontSize:11, color:'rgba(44,58,71,0.4)', textAlign:'right' }}>{profile.bio.length}/200</p>
              </div>

              {/* Divider */}
              <div style={{ borderTop:'1px solid rgba(44,58,71,0.07)', paddingTop:16, marginTop:4 }}>
                <h3 style={{ fontSize:13, fontWeight:800, color:'#2C3A47', marginBottom:14 }}>Change Password</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <Inp label="Current Password" type="password" placeholder="••••••••"/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <Inp label="New Password"     type="password" placeholder="Min. 8 characters"/>
                    <Inp label="Confirm Password" type="password" placeholder="Repeat new password"/>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:10, paddingTop:4, flexWrap:'wrap' }}>
                <Btn type="submit">Save Profile</Btn>
                <Btn variant="secondary" onClick={()=>toast('Password updated')}>Update Password</Btn>
                <Btn variant="danger" onClick={()=>toast('Signed out','info')}>Sign Out</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ SCHOOL ════ */}
      {tab==='school' && (
        <div style={{ maxWidth:620 }}>
          {/* School logo card */}
          <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'24px', marginBottom:16, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ width:72, height:72, borderRadius:16, background:'#2C3A47', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <OrbitMark width={44} dark={true}/>
            </div>
            <div style={{ flex:1, minWidth:160 }}>
              <p style={{ fontSize:16, fontWeight:900, color:'#2C3A47' }}>{school.name}</p>
              <p style={{ fontSize:13, color:'rgba(44,58,71,0.5)', marginTop:2 }}>{school.province} · {school.phase} School</p>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <Btn size="sm" variant="secondary" onClick={()=>toast('Logo upload coming soon','info')}>Upload Logo</Btn>
                <Btn size="sm" variant="ghost">Remove</Btn>
              </div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'24px' }}>
            <form onSubmit={e=>{e.preventDefault();toast('School settings saved');}} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:'#2C3A47', marginBottom:0 }}>School Details</h2>
              <Inp label="School Name" value={school.name} onChange={e=>updS('name',e.target.value)} required/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Sel label="Province" value={school.province} onChange={e=>updS('province',e.target.value)}>
                  {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'].map(p=><option key={p}>{p}</option>)}
                </Sel>
                <Sel label="School Type" value={school.type} onChange={e=>updS('type',e.target.value)}>
                  {['Public','Private','Independent','Charter'].map(t=><option key={t}>{t}</option>)}
                </Sel>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Inp label="Admin Email" type="email" value={school.email} onChange={e=>updS('email',e.target.value)}/>
                <Inp label="Phone"       value={school.phone}   onChange={e=>updS('phone',e.target.value)}/>
              </div>
              <Inp label="Physical Address" value={school.address} onChange={e=>updS('address',e.target.value)}/>
              <Inp label="Website (optional)" value={school.website} onChange={e=>updS('website',e.target.value)} placeholder="www.school.co.za"/>

              <div style={{ borderTop:'1px solid rgba(44,58,71,0.07)', paddingTop:16 }}>
                <h3 style={{ fontSize:13, fontWeight:800, color:'#2C3A47', marginBottom:14 }}>Library Rules</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <Inp label="Loan Period (days)"    type="number" value={school.loanDays}  onChange={e=>updS('loanDays',e.target.value)}/>
                  <Inp label="Max Books Per Learner" type="number" value={school.maxBooks}  onChange={e=>updS('maxBooks',e.target.value)}/>
                  <Inp label="Fine Per Day (R)"      type="number" value={school.finePerDay}onChange={e=>updS('finePerDay',e.target.value)}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
                  <Inp label="Library Opens" type="time" value={school.openTime}  onChange={e=>updS('openTime',e.target.value)}/>
                  <Inp label="Library Closes" type="time" value={school.closeTime} onChange={e=>updS('closeTime',e.target.value)}/>
                </div>
              </div>
              <div style={{ paddingTop:4 }}><Btn type="submit">Save School Settings</Btn></div>
            </form>
          </div>
        </div>
      )}

      {/* ════ NOTIFICATIONS ════ */}
      {tab==='notifications' && (
        <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'24px', maxWidth:560 }}>
          <h2 style={{ fontSize:14, fontWeight:800, color:'#2C3A47', marginBottom:4 }}>Notification Preferences</h2>
          <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginBottom:18 }}>Choose when and how you receive alerts</p>

          <p style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'rgba(44,58,71,0.4)', marginBottom:4 }}>SMS Alerts</p>
          <NotifRow k="smsOverdue"  label="Overdue SMS to Learners"  desc="Automatically SMS learners with overdue books each night"/>
          <NotifRow k="smsReminder" label="Due Date Reminder SMS"    desc="Remind learners 2 days before their book is due"/>

          <p style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'rgba(44,58,71,0.4)', marginTop:20, marginBottom:4 }}>Email Reports</p>
          <NotifRow k="emailSummary"  label="Weekly Summary Email"    desc="Receive a library report every Monday morning"/>
          <NotifRow k="emailNew"      label="New Registration Alerts" desc="Email when a new learner registers on the portal"/>
          <NotifRow k="overdueReport" label="Monthly Overdue Report"  desc="Full overdue report on the 1st of each month"/>

          <p style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'rgba(44,58,71,0.4)', marginTop:20, marginBottom:4 }}>Library Activity</p>
          <NotifRow k="newBookAlert"   label="New Book Added"       desc="Notify staff when a new book is catalogued"/>
          <NotifRow k="lowStockAlert"  label="Low Stock Warnings"   desc="Alert when any book has 0 copies available"/>
          <NotifRow k="returnConfirm"  label="Return Confirmations" desc="Send confirmation to learner when book is marked returned"/>
        </div>
      )}

      {/* ════ APPEARANCE ════ */}
      {tab==='appearance' && (
        <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', padding:'24px', maxWidth:520 }}>
          <h2 style={{ fontSize:14, fontWeight:800, color:'#2C3A47', marginBottom:18 }}>Display Preferences</h2>

          {/* Accent colour */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47', marginBottom:4 }}>Accent Colour</p>
            <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginBottom:10 }}>Choose the highlight colour used across the interface</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[
                { k:'steel',    c:'#4B8EBA', l:'Steel'    },
                { k:'slate',    c:'#2C3A47', l:'Slate'    },
                { k:'golden',   c:'#F6B93B', l:'Golden'   },
                { k:'lavender', c:'#A29FEC', l:'Lavender' },
                { k:'green',    c:'#22c55e', l:'Green'    },
                { k:'red',      c:'#ef4444', l:'Red'      },
              ].map(ac=>(
                <button key={ac.k} type="button" onClick={()=>{ updA('accentColor',ac.k); toast(`Accent changed to ${ac.l}`); }}
                  style={{ width:36, height:36, borderRadius:'50%', background:ac.c, border:appear.accentColor===ac.k?'3px solid #2C3A47':'2px solid rgba(44,58,71,0.1)', cursor:'pointer', transition:'all 0.12s', position:'relative' }}>
                  {appear.accentColor===ac.k && <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'white' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Date format */}
          <div style={{ marginBottom:18 }}>
            <Sel label="Date Format" value={appear.dateFormat} onChange={e=>updA('dateFormat',e.target.value)}>
              <option value="dd/mm/yyyy">DD/MM/YYYY (22/04/2026)</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY (04/22/2026)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (2026-04-22)</option>
              <option value="long">Long (22 April 2026)</option>
            </Sel>
          </div>

          {/* Density */}
          <div style={{ marginBottom:18 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47', marginBottom:8 }}>Interface Density</p>
            <div style={{ display:'flex', gap:8 }}>
              {['compact','comfortable','spacious'].map(d=>(
                <button key={d} type="button" onClick={()=>updA('densityMode',d)}
                  style={{ padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:`1.5px solid ${appear.densityMode===d?'#2C3A47':'rgba(44,58,71,0.15)'}`, background:appear.densityMode===d?'#2C3A47':'white', color:appear.densityMode===d?'#F0E5DF':'rgba(44,58,71,0.6)', textTransform:'capitalize', transition:'all 0.1s' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            {[
              { k:'darkSidebar', l:'Dark Sidebar', d:'Use the dark colour scheme for the navigation sidebar' },
            ].map(item=>(
              <div key={item.k} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, padding:'14px 0', borderTop:'1px solid rgba(44,58,71,0.07)' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47' }}>{item.l}</p>
                  <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:2 }}>{item.d}</p>
                </div>
                <button type="button" onClick={()=>{ updA(item.k,!appear[item.k]); toast(appear[item.k]?'Disabled':'Enabled'); }}
                  style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', padding:2, flexShrink:0, background:appear[item.k]?'linear-gradient(135deg,#C4C0FB,#4B8EBA)':'rgba(44,58,71,0.18)', transition:'background 0.15s' }}>
                  <span style={{ display:'block', width:20, height:20, borderRadius:'50%', background:'white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transform:appear[item.k]?'translateX(20px)':'translateX(0)', transition:'transform 0.15s' }}/>
                </button>
              </div>
            ))}
          </div>

          <div style={{ paddingTop:12 }}><Btn onClick={()=>toast('Appearance saved')}>Save Preferences</Btn></div>
        </div>
      )}

      {/* ════ TEAM ════ */}
      {tab==='team' && (
        <div style={{ maxWidth:600 }}>
          <div style={{ background:'white', borderRadius:20, border:'1px solid rgba(44,58,71,0.08)', overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(44,58,71,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:'#2C3A47' }}>Staff Members</p>
                <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:1 }}>{team.length} team members</p>
              </div>
              <Btn size="sm" onClick={()=>setShowInvite(true)}>+ Invite Staff</Btn>
            </div>
            {team.map((member,i)=>(
              <div key={member.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<team.length-1?'1px solid rgba(44,58,71,0.06)':'none' }}>
                <Avatar name={member.name} size={40}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47' }}>{member.name}</p>
                    <Badge variant={member.status==='active'?'steel':'warning'}>{member.status==='active'?'Active':'Pending'}</Badge>
                  </div>
                  <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:1 }}>{member.role} · {member.email}</p>
                  <p style={{ fontSize:11, color:'rgba(44,58,71,0.35)', marginTop:1 }}>Last active: {member.last}</p>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {member.status==='pending' && <Btn size="sm" variant="secondary" onClick={()=>{ setTeam(t=>t.map(m=>m.id===member.id?{...m,status:'active',last:'Just now'}:m)); toast(`${member.name} approved`); }}>Approve</Btn>}
                  <Btn size="sm" variant="ghost" onClick={()=>{ setTeam(t=>t.filter(m=>m.id!==member.id)); toast(`${member.name} removed`,'error'); }}>Remove</Btn>
                </div>
              </div>
            ))}
          </div>

          {/* Roles info */}
          <div style={{ background:'rgba(75,142,186,0.06)', borderRadius:16, padding:'16px 20px', border:'1px solid rgba(75,142,186,0.15)' }}>
            <p style={{ fontSize:12, fontWeight:800, color:'#4B8EBA', marginBottom:10 }}>Role Permissions</p>
            {[
              { role:'Administrator', perms:'Full access — settings, team, reports, all data' },
              { role:'Head Librarian',perms:'All library functions — add books, manage loans, view reports' },
              { role:'Librarian',     perms:'Check in/out, manage catalogue, view learners' },
              { role:'Volunteer',     perms:'Check in/out books only' },
            ].map(r=>(
              <div key={r.role} style={{ display:'flex', gap:10, marginBottom:6 }}>
                <Badge variant={r.role==='Administrator'?'golden':r.role==='Head Librarian'?'steel':'neutral'}>{r.role}</Badge>
                <p style={{ fontSize:12, color:'rgba(44,58,71,0.6)' }}>{r.perms}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite modal */}
      <Modal open={showInvite} onClose={()=>setShowInvite(false)} title="Invite Staff Member">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Inp label="Email Address" type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@school.co.za" required icon="✉"/>
          <Sel label="Role" value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>
            {['Librarian','Head Librarian','Volunteer'].map(r=><option key={r}>{r}</option>)}
          </Sel>
          <div style={{ background:'rgba(240,229,223,0.6)', borderRadius:12, padding:'10px 14px', fontSize:12, color:'rgba(44,58,71,0.65)' }}>
            An invitation email will be sent to the address above.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Btn variant="secondary" fullWidth onClick={()=>setShowInvite(false)}>Cancel</Btn>
            <Btn fullWidth disabled={!inviteEmail} onClick={()=>{ setTeam(t=>[...t,{ id:'t'+Date.now(), name:inviteEmail.split('@')[0], role:inviteRole, email:inviteEmail, status:'pending', last:'Never' }]); toast(`Invite sent to ${inviteEmail}`); setShowInvite(false); setInviteEmail(''); }}>Send Invite</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Learner Portal helpers ────────────────────────────────────────────────────
const DEMO_LEARNER = { id:'l01', name:'Thabo Mokoena', grade:'Grade 10', email:'thabo.m@orbit.edu' };

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000*60*60*24));
}

function DueCountdown({ due, status }) {
  if (status === 'returned') return null;
  const days = daysUntil(due);
  if (days < 0) return <span style={{ fontSize:11, fontWeight:800, color:'#dc2626', background:'#fef2f2', padding:'3px 8px', borderRadius:99 }}>⚠ {Math.abs(days)} days overdue</span>;
  if (days === 0) return <span style={{ fontSize:11, fontWeight:800, color:'#d97706', background:'#fffbeb', padding:'3px 8px', borderRadius:99 }}>Due today!</span>;
  if (days <= 3)  return <span style={{ fontSize:11, fontWeight:800, color:'#d97706', background:'#fffbeb', padding:'3px 8px', borderRadius:99 }}>Due in {days} day{days!==1?'s':''}</span>;
  return <span style={{ fontSize:11, fontWeight:600, color:'rgba(44,58,71,0.45)' }}>Due {fmtDate(due)}</span>;
}

const NOTIFICATIONS_INIT = [
  { id:'n1', type:'overdue',   title:'Book overdue',              body:'"To Kill a Mockingbird" was due on 15 Apr. Please return it.', time:'2 days ago',   read:false },
  { id:'n2', type:'reminder',  title:'Due in 3 days',             body:'"Things Fall Apart" is due on 19 Apr.',                       time:'Yesterday',    read:false },
  { id:'n3', type:'available', title:'Reserved book available',   body:'"Born a Crime" is now available for pickup at the library.',  time:'3 days ago',   read:true  },
  { id:'n4', type:'new',       title:'New book added',            body:'"The Heaven & Earth Grocery Store" has been added.',          time:'1 week ago',   read:true  },
];

const RECOMMENDATIONS = [
  { title:'Animal Farm',              author:'George Orwell',     reason:'Based on your Fiction reads' },
  { title:'The Great Gatsby',         author:'F. Scott Fitzgerald',reason:'Popular in your grade'       },
  { title:'Born a Crime',             author:'Trevor Noah',       reason:'South African literature'     },
  { title:'The Diary of a Young Girl',author:'Anne Frank',        reason:'Similar to your history'      },
];

function LearnerPortalPage({ books, loans, isMobile }) {
  const [authed,  setAuthed]  = React.useState(false);
  const [learner, setLearner] = React.useState(null);
  const [tab,     setTab]     = React.useState('home');
  const [q,       setQ]       = React.useState('');
  const [genreFilter, setGenreFilter] = React.useState('All');
  const [notifs,  setNotifs]  = React.useState(NOTIFICATIONS_INIT);
  const [renewRequested, setRenewRequested] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();

  const myLoans = loans.filter(l => l.learnerId === learner?.id);
  const active  = myLoans.filter(l => l.status !== 'returned');
  const returned= myLoans.filter(l => l.status === 'returned');
  const overdue = myLoans.filter(l => l.status === 'overdue');
  const unread  = notifs.filter(n => !n.read).length;
  const GOAL    = 12; // books this year
  const booksThisYear = returned.length + 3; // +3 demo history

  const genres  = ['All', ...Array.from(new Set(books.map(b => b.genre)))];
  const filteredBooks = books.filter(b => {
    const mq = !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase());
    const mg = genreFilter === 'All' || b.genre === genreFilter;
    return mq && mg;
  });

  function handleLogin(e) {
    e.preventDefault(); setLoading(true);
    setTimeout(() => { setLoading(false); setAuthed(true); setLearner(DEMO_LEARNER); toast('Welcome back, Thabo! 👋'); }, 700);
  }
  function requestRenewal(loan) {
    setRenewRequested(r => ({ ...r, [loan.id]: true }));
    toast(`Renewal request sent for "${loan.bookTitle}"`);
  }
  function markAllRead() { setNotifs(ns => ns.map(n => ({ ...n, read:true }))); }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#F0E5DF', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:32 }}>
            <OrbitMark width={68} dark={false}/>
            <div style={{ textAlign:'center' }}>
              <h1 style={{ fontSize:22, fontWeight:900, color:'#2C3A47' }}>Learner Portal</h1>
              <p style={{ fontSize:13, color:'rgba(44,58,71,0.5)', marginTop:4 }}>Your books, your reading journey</p>
            </div>
          </div>
          <div style={{ background:'white', borderRadius:24, boxShadow:'0 12px 40px rgba(44,58,71,0.14)', padding:28 }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#2C3A47', marginBottom:18 }}>Sign in</h2>
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Inp label="Student email" type="email" defaultValue="thabo.m@orbit.edu" placeholder="thabo@school.co.za" icon="✉"/>
              <Inp label="Password" type="password" defaultValue="password123" placeholder="••••••••" icon="🔒"/>
              <Btn type="submit" loading={loading} fullWidth size="lg">Sign In</Btn>
            </form>
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(44,58,71,0.35)', marginTop:14 }}>Demo: credentials are pre-filled</p>
          </div>
        </div>
      </div>
    );
  }

  // ── PORTAL TABS ────────────────────────────────────────────────────────────
  const TABS = [
    { id:'home',    icon:'⊞', label:'Home'    },
    { id:'books',   icon:'📖', label:'My Books' },
    { id:'browse',  icon:'🔍', label:'Browse'  },
    { id:'history', icon:'📋', label:'History' },
    { id:'notifs',  icon:'🔔', label:'Alerts', badge: unread },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F0E5DF', overflow:'hidden' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'white', borderBottom:'1px solid rgba(44,58,71,0.08)', padding:'11px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <OrbitMark width={24} dark={false}/>
          <span style={{ fontWeight:800, fontSize:13, color:'#2C3A47' }}>Learner Portal</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar name={learner?.name||''} size={28}/>
          {!isMobile && <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#2C3A47', lineHeight:1 }}>{learner?.name}</p>
            <p style={{ fontSize:10, color:'rgba(44,58,71,0.5)', marginTop:1 }}>{learner?.grade}</p>
          </div>}
          <Btn size="sm" variant="secondary" onClick={()=>{ setAuthed(false); setLearner(null); setTab('home'); }}>Sign Out</Btn>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background:'white', borderBottom:'1px solid rgba(44,58,71,0.06)', display:'flex', overflowX:'auto', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={()=>setTab(t.id)}
            style={{ flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'11px 14px',
              border:'none', borderBottom:`2px solid ${tab===t.id?'#4B8EBA':'transparent'}`,
              background:'transparent', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
              fontSize:12, fontWeight:700, color:tab===t.id?'#4B8EBA':'rgba(44,58,71,0.5)', transition:'all 0.12s', position:'relative' }}>
            <span style={{ fontSize:15 }}>{t.icon}</span>
            {t.label}
            {t.badge > 0 && (
              <span style={{ position:'absolute', top:8, right:8, width:14, height:14, borderRadius:'50%', background:'#ef4444', color:'white', fontSize:9, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'16px' }}>

        {/* ════ HOME ════ */}
        {tab==='home' && <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Welcome hero */}
          <div style={{ background:'#2C3A47', borderRadius:20, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-30, top:-30, opacity:0.055, pointerEvents:'none' }}>
              <OrbitMark width={140}/>
            </div>
            <p style={{ fontSize:10, fontWeight:800, letterSpacing:2.5, textTransform:'uppercase', color:'rgba(240,229,223,0.4)', marginBottom:6 }}>Welcome back</p>
            <p style={{ fontSize:22, fontWeight:900, color:'#F0E5DF', letterSpacing:'-0.5px' }}>{learner?.name?.split(' ')[0]} 👋</p>
            <p style={{ fontSize:12, color:'rgba(240,229,223,0.5)', marginTop:2 }}>{learner?.grade} · {learner?.email}</p>
            {overdue.length > 0 && (
              <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(239,68,68,0.15)', borderRadius:12, border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>⚠</span>
                <p style={{ fontSize:12, fontWeight:700, color:'#fca5a5' }}>{overdue.length} book{overdue.length>1?'s':''} overdue — please return to the library</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { l:'Books Out',      v:active.length,   c:'#4B8EBA', bg:'rgba(75,142,186,0.08)' },
              { l:'Overdue',        v:overdue.length,  c:overdue.length>0?'#dc2626':'#22c55e', bg:overdue.length>0?'rgba(239,68,68,0.07)':'rgba(34,197,94,0.07)' },
              { l:'Read This Year', v:booksThisYear,   c:'#2C3A47', bg:'rgba(44,58,71,0.05)'  },
            ].map(s=>(
              <div key={s.l} style={{ background:'white', borderRadius:14, padding:'14px 10px', textAlign:'center', border:'1px solid rgba(44,58,71,0.07)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:s.bg, borderRadius:14 }}/>
                <div style={{ position:'relative', fontSize:26, fontWeight:900, color:s.c, lineHeight:1 }}>{s.v}</div>
                <div style={{ position:'relative', fontSize:10, fontWeight:700, color:'rgba(44,58,71,0.5)', marginTop:4, lineHeight:1.3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Reading goal */}
          <div style={{ background:'white', borderRadius:16, padding:'16px 18px', border:'1px solid rgba(44,58,71,0.07)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:'#2C3A47' }}>Reading Goal 2026</p>
                <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:1 }}>{booksThisYear} of {GOAL} books</p>
              </div>
              <span style={{ fontSize:22 }}>{booksThisYear >= GOAL ? '🏆' : '📚'}</span>
            </div>
            <div style={{ height:8, background:'rgba(44,58,71,0.08)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:8, background:'#F6B93B', borderRadius:99, width:`${Math.min((booksThisYear/GOAL)*100,100)}%`, transition:'width 0.6s ease' }}/>
            </div>
            <p style={{ fontSize:11, color:'rgba(44,58,71,0.45)', marginTop:6 }}>{GOAL - booksThisYear > 0 ? `${GOAL - booksThisYear} more to reach your goal!` : '🎉 Goal reached — keep reading!'}</p>
          </div>

          {/* Currently borrowed */}
          {active.length > 0 ? (
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:'#2C3A47', marginBottom:10 }}>Currently Borrowed</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {active.map(loan => {
                  const isOverdue = loan.status === 'overdue';
                  const renewed   = renewRequested[loan.id];
                  return (
                    <div key={loan.id} style={{ background:'white', borderRadius:16, padding:'14px 16px', border:`1.5px solid ${isOverdue?'#fecaca':'rgba(44,58,71,0.07)'}` }}>
                      <div style={{ display:'flex', gap:14 }}>
                        <BookCover title={loan.bookTitle} width={48} height={67}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:800, color:'#2C3A47', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loan.bookTitle}</p>
                          <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:2 }}>{books.find(b=>b.id===loan.bookId)?.author}</p>
                          <div style={{ marginTop:8 }}><DueCountdown due={loan.due} status={loan.status}/></div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display:'flex', gap:8, marginTop:12, borderTop:'1px solid rgba(44,58,71,0.06)', paddingTop:12 }}>
                        {!isOverdue && (
                          <Btn size="sm" variant={renewed?'secondary':'ghost'} onClick={()=>!renewed&&requestRenewal(loan)} disabled={renewed}>
                            {renewed ? '✓ Renewal Requested' : '↻ Request Renewal'}
                          </Btn>
                        )}
                        {isOverdue && <p style={{ fontSize:12, fontWeight:700, color:'#dc2626' }}>⚠ Please return this book urgently</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background:'white', borderRadius:16, padding:'32px 20px', textAlign:'center', border:'1px solid rgba(44,58,71,0.07)' }}>
              <p style={{ fontSize:28, marginBottom:8 }}>📚</p>
              <p style={{ fontSize:14, fontWeight:700, color:'#2C3A47' }}>No books checked out</p>
              <p style={{ fontSize:12, color:'rgba(44,58,71,0.5)', marginTop:4 }}>Visit the library to borrow a book</p>
              <div style={{ marginTop:14 }}><Btn size="sm" onClick={()=>setTab('browse')}>Browse Catalogue</Btn></div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:'#2C3A47', marginBottom:10 }}>Recommended for You</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {RECOMMENDATIONS.map(r => (
                <div key={r.title} style={{ background:'white', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(44,58,71,0.07)', display:'flex', gap:10, alignItems:'flex-start' }}>
                  <BookCover title={r.title} width={36} height={50}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:800, color:'#2C3A47', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</p>
                    <p style={{ fontSize:11, color:'rgba(44,58,71,0.5)', marginTop:1 }}>{r.author}</p>
                    <p style={{ fontSize:10, color:'#4B8EBA', fontWeight:600, marginTop:4 }}>{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* ════ MY BOOKS ════ */}
        {tab==='books' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <p style={{ fontSize:16, fontWeight:900, color:'#2C3A47' }}>My Books</p>
          {active.length === 0 ? (
            <div style={{ background:'white', borderRadius:16, padding:'36px 20px', textAlign:'center', border:'1px solid rgba(44,58,71,0.07)' }}>
              <p style={{ fontSize:24, marginBottom:8 }}>📭</p>
              <p style={{ fontSize:14, fontWeight:700, color:'#2C3A47' }}>No books currently borrowed</p>
              <div style={{ marginTop:12 }}><Btn size="sm" onClick={()=>setTab('browse')}>Browse books</Btn></div>
            </div>
          ) : active.map(loan => {
            const isOverdue = loan.status === 'overdue';
            const renewed   = renewRequested[loan.id];
            return (
              <div key={loan.id} style={{ background:'white', borderRadius:18, border:`2px solid ${isOverdue?'#fecaca':'rgba(44,58,71,0.08)'}`, overflow:'hidden' }}>
                {isOverdue && <div style={{ background:'#dc2626', padding:'8px 16px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14, color:'white' }}>⚠</span>
                  <p style={{ fontSize:12, fontWeight:800, color:'white' }}>OVERDUE — Please return immediately</p>
                </div>}
                <div style={{ padding:'16px' }}>
                  <div style={{ display:'flex', gap:14 }}>
                    <BookCover title={loan.bookTitle} width={56} height={78}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:900, color:'#2C3A47', lineHeight:1.3 }}>{loan.bookTitle}</p>
                      <p style={{ fontSize:12, color:'rgba(44,58,71,0.55)', marginTop:2 }}>{books.find(b=>b.id===loan.bookId)?.author}</p>
                      <p style={{ fontSize:11, color:'rgba(44,58,71,0.4)', marginTop:3 }}>Borrowed {fmtDate(loan.out)}</p>
                      <div style={{ marginTop:8 }}><DueCountdown due={loan.due} status={loan.status}/></div>
                    </div>
                  </div>
                  {!isOverdue && (
                    <div style={{ marginTop:14, display:'flex', gap:8 }}>
                      <Btn size="sm" variant={renewed?'secondary':'primary'} onClick={()=>!renewed&&requestRenewal(loan)} disabled={renewed}>
                        {renewed ? '✓ Renewal Sent' : '↻ Renew'}
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>}

        {/* ════ BROWSE ════ */}
        {tab==='browse' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <p style={{ fontSize:16, fontWeight:900, color:'#2C3A47' }}>Browse Catalogue</p>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(44,58,71,0.35)', fontSize:14 }}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by title or author…"
              style={{ width:'100%', borderRadius:14, border:'1.5px solid rgba(44,58,71,0.15)', background:'white', paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10, fontSize:13, fontFamily:'inherit', color:'#2C3A47', outline:'none' }}/>
          </div>
          {/* Genre filter */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
            {genres.map(g=>(
              <button key={g} type="button" onClick={()=>setGenreFilter(g)}
                style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:700, border:`1.5px solid ${genreFilter===g?'#2C3A47':'rgba(44,58,71,0.15)'}`, background:genreFilter===g?'#2C3A47':'white', color:genreFilter===g?'#F0E5DF':'rgba(44,58,71,0.6)', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all 0.1s' }}>
                {g}
              </button>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {filteredBooks.map(b=>(
              <div key={b.id} style={{ background:'white', borderRadius:14, padding:'14px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center', border:'1px solid rgba(44,58,71,0.07)' }}>
                <BookCover title={b.title} width={54} height={75}/>
                <p style={{ fontSize:12, fontWeight:800, color:'#2C3A47', lineHeight:1.3 }}>{b.title}</p>
                <p style={{ fontSize:11, color:'rgba(44,58,71,0.45)' }}>{b.author}</p>
                <Badge variant={b.available>0?'steel':'neutral'}>{b.available>0?`${b.available} available`:'Checked out'}</Badge>
                {b.available===0 && <button type="button" onClick={()=>toast(`Reserved "${b.title}" — you'll be notified when available`,'info')}
                  style={{ fontSize:11, color:'#4B8EBA', fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>🔔 Reserve</button>}
              </div>
            ))}
            {filteredBooks.length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px 0', color:'rgba(44,58,71,0.4)', fontSize:13 }}>No books found</div>}
          </div>
        </div>}

        {/* ════ HISTORY ════ */}
        {tab==='history' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Stats */}
          <div style={{ background:'white', borderRadius:16, padding:'16px 18px', border:'1px solid rgba(44,58,71,0.07)', display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ textAlign:'center', flex:1 }}>
              <p style={{ fontSize:24, fontWeight:900, color:'#4B8EBA' }}>{myLoans.length}</p>
              <p style={{ fontSize:11, fontWeight:600, color:'rgba(44,58,71,0.5)' }}>Total Loans</p>
            </div>
            <div style={{ width:1, height:40, background:'rgba(44,58,71,0.08)' }}/>
            <div style={{ textAlign:'center', flex:1 }}>
              <p style={{ fontSize:24, fontWeight:900, color:'#22c55e' }}>{returned.length}</p>
              <p style={{ fontSize:11, fontWeight:600, color:'rgba(44,58,71,0.5)' }}>Returned</p>
            </div>
            <div style={{ width:1, height:40, background:'rgba(44,58,71,0.08)' }}/>
            <div style={{ textAlign:'center', flex:1 }}>
              <p style={{ fontSize:24, fontWeight:900, color:'#F6B93B' }}>{booksThisYear}</p>
              <p style={{ fontSize:11, fontWeight:600, color:'rgba(44,58,71,0.5)' }}>This Year</p>
            </div>
          </div>
          <p style={{ fontSize:13, fontWeight:800, color:'#2C3A47' }}>All Loans ({myLoans.length})</p>
          {myLoans.length===0
            ? <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(44,58,71,0.4)', fontSize:13 }}>No loan history yet</div>
            : myLoans.map((loan,i)=>(
              <div key={loan.id} style={{ background:'white', borderRadius:14, padding:'14px 16px', display:'flex', gap:12, alignItems:'center', border:'1px solid rgba(44,58,71,0.07)' }}>
                <BookCover title={loan.bookTitle} width={36} height={50}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#2C3A47', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loan.bookTitle}</p>
                  <p style={{ fontSize:11, color:'rgba(44,58,71,0.45)', marginTop:2 }}>{fmtDate(loan.out)} → {loan.status==='returned'?fmtDate(loan.due):'Present'}</p>
                </div>
                <StatusChip status={loan.status}/>
              </div>
            ))
          }
        </div>}

        {/* ════ NOTIFICATIONS ════ */}
        {tab==='notifs' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:16, fontWeight:900, color:'#2C3A47' }}>Notifications {unread>0&&<span style={{ fontSize:12, fontWeight:700, color:'#ef4444' }}>({unread} unread)</span>}</p>
            {unread>0 && <button type="button" onClick={markAllRead} style={{ fontSize:12, fontWeight:700, color:'#4B8EBA', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Mark all read</button>}
          </div>
          {notifs.map(n=>{
            const icons = { overdue:'⚠', reminder:'🔔', available:'✅', new:'🆕' };
            const colors = { overdue:'#fef2f2', reminder:'#fffbeb', available:'#f0fdf4', new:'rgba(75,142,186,0.07)' };
            return (
              <div key={n.id} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}
                style={{ background:n.read?'white':colors[n.type]||'white', borderRadius:14, padding:'14px 16px', border:`1.5px solid ${n.read?'rgba(44,58,71,0.07)':'rgba(44,58,71,0.12)'}`, cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{icons[n.type]}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <p style={{ fontSize:13, fontWeight:n.read?600:800, color:'#2C3A47' }}>{n.title}</p>
                    {!n.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'#4B8EBA', flexShrink:0, marginTop:3 }}/>}
                  </div>
                  <p style={{ fontSize:12, color:'rgba(44,58,71,0.55)', marginTop:2, lineHeight:1.4 }}>{n.body}</p>
                  <p style={{ fontSize:11, color:'rgba(44,58,71,0.35)', marginTop:4 }}>{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>}

      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App({ isMobile }) {
  const [page, setPage]         = React.useState('login');
  const [authed, setAuthed]     = React.useState(false);
  const [books, setBooks]       = React.useState(BOOKS_INIT);
  const [learners, setLearners] = React.useState(LEARNERS_INIT);
  const [loans, setLoans]       = React.useState(LOANS_INIT);

  // Expose nav globally for device bar pills
  React.useEffect(() => {
    window.__appNavTo = (p) => {
      const dashPages = ['dashboard','catalogue','loans','learners','reports','settings'];
      if (dashPages.includes(p)) { setAuthed(true); setPage(p); }
      else { setAuthed(false); setPage(p); }
    };
    // Sync bottom pills
    document.querySelectorAll('.pnav-btn').forEach(b => {
      const m = b.getAttribute('onclick')?.match(/'([^']+)'/);
      if (m) b.classList.toggle('active', m[1] === page);
    });
  }, [page]);

  React.useEffect(() => {
    if (authed && page==='login') setPage('dashboard');
    if (!authed && !['login','register','forgot','learner-portal'].includes(page)) setPage('login');
  }, [authed]);

  const authPages = ['login','register','forgot'];
  const isAuth    = authPages.includes(page);
  const isLearner = page === 'learner-portal';

  const sharedProps = { isMobile, loans, setLoans, books, setBooks, learners, setLearners };

  return (
    <ToastProvider>
      <div style={{ height:'100%', fontFamily:"'Montserrat', sans-serif", display:'flex', flexDirection:'column' }}>
        {isAuth && (
          <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
            {page==='login'    && <LoginPage setPage={setPage} setAuthed={setAuthed}/>}
            {page==='register' && <RegisterPage setPage={setPage}/>}
            {page==='forgot'   && <ForgotPage setPage={setPage}/>}
          </div>
        )}
        {isLearner && (
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <LearnerPortalPage books={books} loans={loans} isMobile={isMobile}/>
          </div>
        )}
        {!isAuth && !isLearner && (
          <div style={{ flex:1, overflow:'hidden' }}>
            <DashboardShell page={page} setPage={setPage} isMobile={isMobile}>
              {page==='dashboard' && <DashboardPage {...sharedProps} setPage={setPage}/>}
              {page==='catalogue' && <CataloguePage {...sharedProps}/>}
              {page==='loans'     && <LoansPage {...sharedProps}/>}
              {page==='learners'  && <LearnersPage {...sharedProps}/>}
              {page==='reports'   && <ReportsPage {...sharedProps}/>}
              {page==='settings'  && <SettingsPage isMobile={isMobile}/>}
            </DashboardShell>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

Object.assign(window, { App });
