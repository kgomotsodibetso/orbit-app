import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Learner portal routes ───────────────────────────────────────────────
  // Learners are not Supabase auth users — they authenticate with a PIN
  // and get a simple httpOnly session cookie: orbit_learner_session
  if (pathname === '/learner' || pathname.startsWith('/learner/')) {
    const isLearnerLogin = pathname === '/learner/login';
    const session = request.cookies.get('orbit_learner_session');

    if (!session && !isLearnerLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/learner/login';
      return NextResponse.redirect(url);
    }

    if (session && isLearnerLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/learner';
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  // ── Public API routes — bypass Supabase entirely ──────────────────────
  // These routes handle their own auth. Skipping the Supabase client here
  // prevents NextResponse.next({ request }) from being called twice, which
  // in Next.js 16 can exhaust the POST body stream before the handler reads it.
  const isPublicApi =
    pathname.startsWith('/api/onboarding') ||
    pathname.startsWith('/api/isbn') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/learner');

  if (isPublicApi) return NextResponse.next();

  // ── Admin / librarian routes (Supabase auth) ───────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
