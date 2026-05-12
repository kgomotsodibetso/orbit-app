import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orbittech.app';

export const metadata: Metadata = {
  title: "Orbit Tech · Mission Control",
  description:
    "Smart library management for South African schools. Scan, track, and inspire.",
  manifest: "/manifest.json",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: "Orbit Tech · Mission Control",
    description: "Smart library management for South African schools. Scan, track, and inspire.",
    url: BASE_URL,
    siteName: "Orbit Tech",
    type: "website",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Orbit Tech · Mission Control',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit Tech · Mission Control",
    description: "Smart library management for South African schools. Scan, track, and inspire.",
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#4B8EBA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The nonce is injected by the middleware (proxy.ts) on every request.
  // Next.js reads x-nonce automatically and stamps it onto its own hydration
  // <script> tags. We also expose it here for any custom <Script> usage.
  const nonce = (await headers()).get('x-nonce') ?? '';

  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <head>
        {/* Explicit nonce meta so client-side code can read it if needed */}
        {nonce && <meta name="x-nonce" content={nonce} />}
      </head>
      <body className="min-h-full antialiased font-sans" suppressHydrationWarning>
        <noscript>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0E5DF', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#2C3A47', margin: '0 0 0.5rem' }}>JavaScript is required</p>
              <p style={{ color: 'rgba(44,58,71,0.6)', margin: 0 }}>Please enable JavaScript in your browser to use Orbit Tech.</p>
            </div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}