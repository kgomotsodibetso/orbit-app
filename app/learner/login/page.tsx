'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Hash } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import OrbitLogo from '@/components/ui/OrbitLogo';
import Input from '@/components/ui/Input';

export default function LearnerLoginPage() {
  const router = useRouter();
  const [memberNumber, setMemberNumber] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length < 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    const res = await fetch('/api/learner/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_number: memberNumber, pin: fullPin }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Login failed');
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    } else {
      router.push('/learner');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <OrbitLogo markWidth={80} showWordmark={false} className="mb-4" />
          <h1 className="text-2xl font-bold text-slate tracking-tight">Learner Portal</h1>
          <p className="text-slate/50 text-sm mt-1">Your books, your reading journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Member number"
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value.toUpperCase())}
              placeholder="ORB-0001"
              icon={<Hash weight="light" className="w-4 h-4" />}
              required
              autoComplete="off"
            />

            <div>
              <label className="text-sm font-semibold text-slate block mb-2">PIN</label>
              <div className="flex gap-3 justify-center">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={pinRefs[i]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate/20 focus:outline-none focus:border-lavender focus:ring-2 focus:ring-lavender/20 bg-cream/60"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={!memberNumber || pin.join('').length < 4}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate/40 mt-8">
          © {new Date().getFullYear()} Orbit Tech · Built for South African schools
        </p>
      </div>
    </main>
  );
}
