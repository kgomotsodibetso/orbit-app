'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import OrbitLogo from '@/components/ui/OrbitLogo';
import Button from '@/components/ui/Button';

interface Props {
  defaultName: string;
  defaultEmail: string;
}

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

export default function OnboardingForm({ defaultName, defaultEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState(defaultName);
  const [institutionName, setInstitutionName] = useState('');
  const [province, setProvince] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email: defaultEmail,
        institutionName,
        province,
        emisNumber: emisNumber || null,
        contactPhone: contactPhone || null,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong. Please try again.');
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <OrbitLogo markWidth={80} showWordmark={false} className="mb-4" />
          <h1 className="text-2xl font-bold text-cream tracking-tight">Mission Control</h1>
          <p className="text-slate/50 text-sm mt-1">Set up your school library</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate mb-1">Almost there</h2>
          <p className="text-sm text-slate/50 mb-6">Tell us about your school to complete setup.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p role="alert" className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Thabo Nkosi"
              required
            />
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
              disabled={!fullName || !institutionName || !province}
              className="w-full"
              size="lg"
            >
              Launch
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
