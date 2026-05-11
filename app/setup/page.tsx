'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OrbitLogo from '@/components/ui/OrbitLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [institutionName, setInstitutionName] = useState('');
  const [province, setProvince] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        fullName: user.user_metadata?.full_name ?? user.email ?? 'Admin',
        email: user.email,
        institutionName,
        province,
        emisNumber: emisNumber || null,
        contactPhone: contactPhone || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // 409 means profile already exists — just continue to dashboard
      if (res.status === 409) {
        router.push('/');
        router.refresh();
        return;
      }
      setError(body.error ?? 'Failed to complete setup. Please try again.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-10">
          <OrbitLogo markWidth={80} showWordmark={false} variant="dark" className="mb-4" />
          <h1 className="text-2xl font-bold text-cream tracking-tight">Complete Your Setup</h1>
          <p className="text-slate/50 text-sm mt-1">We need a few details to finish setting up your school library</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p role="alert" className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-slate mb-2">Your school details</h2>
            <Input
              label="School name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Tshiamiso Primary School"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate">Province</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel focus:border-transparent"
              >
                <option value="">Select province…</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Input
              label="EMIS number (optional)"
              value={emisNumber}
              onChange={(e) => setEmisNumber(e.target.value)}
              placeholder="DBE school number"
            />
            <Input
              label="Contact phone (optional)"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="011 000 0000"
            />
            <Button
              type="submit"
              loading={loading}
              disabled={!institutionName || !province}
              className="w-full"
              size="lg"
            >
              Complete Setup
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate/30 mt-8">
          © {new Date().getFullYear()} Orbit Tech · Built for South African schools
        </p>
      </div>
    </main>
  );
}
