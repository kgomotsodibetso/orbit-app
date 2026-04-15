'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Satellite } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-steel flex items-center justify-center mb-4 shadow-lg">
            <Satellite className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-cream tracking-tight">Mission Control</h1>
          <p className="text-slate/50 text-sm mt-1">Orbit Tech · Library Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate mb-6">Sign in to your library</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              disabled={!email || !password}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate/50 mt-6">
            New school?{' '}
            <Link href="/register" className="text-steel font-semibold hover:underline">
              Create an account
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
