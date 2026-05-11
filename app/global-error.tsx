'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F0E5DF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '5rem', fontWeight: 900, color: '#2C3A47', lineHeight: 1, margin: 0 }}>500</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2C3A47', margin: '1rem 0 0.5rem' }}>Something went wrong</h1>
          <p style={{ color: 'rgba(44,58,71,0.5)', margin: '0 0 2rem' }}>An unexpected error occurred. Our team has been notified.</p>
          <button
            onClick={reset}
            style={{ display: 'inline-block', padding: '0.625rem 1.5rem', background: '#4B8EBA', color: 'white', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}