import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Build a per-request CSP string that replaces 'unsafe-inline' on script-src
// with a cryptographic nonce. Each request gets its own nonce so a captured
// nonce from one response cannot be replayed on another.
function buildCsp(nonce: string): string {
  return [
    // Nonce + strict-dynamic: only scripts with the matching nonce (or
    // transitively trusted by them) are allowed. 'unsafe-eval' is kept for
    // Next.js dev mode; it has no effect in production builds.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live`,
    // Styles still need 'unsafe-inline' because Tailwind/Next.js inject inline
    // <style> blocks that cannot be nonce-tagged at the framework level yet.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://covers.openlibrary.org https://books.google.com`,
    `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co`,
    `frame-src 'self'`,
    // Service worker must be served from same origin; blob: covers workbox
    `worker-src 'self' blob:`,
    `default-src 'self'`,
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  // btoa(randomUUID) produces a URL-safe base64 nonce (~24 chars, 128-bit entropy)
  const nonce = btoa(crypto.randomUUID());

  // Forward nonce to server components via a request header.
  // Next.js reads 'x-nonce' automatically and stamps it on its own hydration
  // <script> tags; layout.tsx can also read it for any custom <Script> usage.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  const requestWithNonce = new NextRequest(request, { headers: requestHeaders });

  // Run Supabase auth session management (may redirect, refresh cookies, etc.)
  const response = await updateSession(requestWithNonce);

  // Stamp CSP on every response — redirect responses included so the header is
  // always present regardless of what updateSession decided to do.
  response.headers.set('Content-Security-Policy', buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    // Skip static files, images, PWA assets, and service worker
    '/((?!_next/static|_next/image|favicon\\.(?:ico|svg|png)|icons|manifest\\.json|sw\\.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};