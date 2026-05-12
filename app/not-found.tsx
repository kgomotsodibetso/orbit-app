import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F0E5DF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '5rem', fontWeight: 900, color: '#2C3A47', lineHeight: 1, margin: 0 }}>404</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2C3A47', margin: '1rem 0 0.5rem' }}>Page not found</h1>
          <p style={{ color: 'rgba(44,58,71,0.5)', margin: '0 0 2rem' }}>This page doesn&apos;t exist or has been moved.</p>
          <Link
            href="/"
            style={{ display: 'inline-block', padding: '0.625rem 1.5rem', background: '#4B8EBA', color: 'white', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Go to Mission Control
          </Link>
        </div>
      </body>
    </html>
  );
}