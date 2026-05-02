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
    // Pages — network first, fall back to cache
    {
      urlPattern: /^https?.*\/$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'pages', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
    },
    // API routes — network only (must be fresh)
    {
      urlPattern: /^https?.*\/api\//,
      handler: 'NetworkOnly',
    },
    // Static assets — cache first
    {
      urlPattern: /\.(?:png|svg|jpg|jpeg|webp|gif|ico|woff2?)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-assets', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
    },
  ],
})(nextConfig);
