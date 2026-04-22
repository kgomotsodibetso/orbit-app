'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import OrbitLogo from '@/components/ui/OrbitLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <OrbitLogo markWidth={80} showWordmark={false} className="mb-4" />
          <h1 className="text-2xl font-bold text-cream tracking-tight">Mission Control</h1>
          <p className="text-slate/50 text-sm mt-1">Orbit Tech · Library Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate mb-2">Reset your password</h2>
          <p className="text-sm text-slate/50 mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="px-4 py-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-sm text-green-700">
                Check your inbox — we&apos;ve sent a password reset link.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="librarian@school.co.za"
                  icon={<Mail className="w-4 h-4" />}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!email}
                  className="w-full"
                  size="lg"
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-slate/50 mt-6">
            <Link href="/login" className="text-steel font-semibold hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate/30 mt-8">
          © {new Date().getFullYear()} Orbit Tech · Built for South African schools
        </p>
      </div>
    </main>
  );
}
