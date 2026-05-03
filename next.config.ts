import type { NextConfig } from "next";
// @ts-expect-error — next-pwa has no type declarations
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Open Library covers (from ISBN lookup API)
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      // Google Books thumbnails
      { protocol: 'https', hostname: 'books.google.com' },
      // Supabase Storage (for user-uploaded covers)
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
  // Don't precache Next.js internals — let the network handle them
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  runtimeCaching: [
    // API routes — always network (never cache, must be fresh)
    {
      urlPattern: /^https?.*\/api\//,
      handler: 'NetworkOnly',
    },
    // Static assets only — cache first, long TTL
    {
      urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico|woff2?)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-assets', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
    },
    // JS/CSS bundles — stale-while-revalidate (serve cache immediately, update in bg)
    {
      urlPattern: /\/_next\/static\//,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'next-static' },
    },
    // Page HTML — network only so React always hydrates fresh markup.
    // Caching page HTML caused the service worker to serve stale rendered HTML
    // which delayed hydration and made buttons require multiple clicks.
    {
      urlPattern: /^https?:\/\/.+\/(?:[^.]*)?$/,
      handler: 'NetworkOnly',
    },
  ],
})(nextConfig);
