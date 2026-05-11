import type { NextConfig } from "next";
// @ts-expect-error — next-pwa has no type declarations
import withPWA from "next-pwa";

// Static security headers applied to every route via Next.js config.
// Content-Security-Policy is intentionally absent here — it is generated
// per-request in proxy.ts (middleware) so each response carries a unique
// nonce, which allows us to drop 'unsafe-inline' from script-src.
const staticSecurityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(self), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: staticSecurityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/api\//,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico|woff2?)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-assets', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
    },
    {
      urlPattern: /\/_next\/static\//,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'next-static' },
    },
    {
      urlPattern: /^https?:\/\/.+\/(?:[^.]*)?$/,
      handler: 'NetworkOnly',
    },
  ],
})(nextConfig);