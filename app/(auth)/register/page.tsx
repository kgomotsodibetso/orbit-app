'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Satellite } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Step = 'account' | 'institution';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Institution fields
  const [institutionName, setInstitutionName] = useState('');
  const [province, setProvince] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'account') { setStep('institution'); return; }

    setLoading(true);
    setError('');

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? 'Sign-up failed');
      setLoading(false);
      return;
    }

    const slug = institutionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 2. Create institution
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .insert({
        name: institutionName,
        slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
        tier: emisNumber ? 3 : 1,
        type: 'school',
        province,
        emis_number: emisNumber || null,
        contact_email: email,
        contact_phone: contactPhone || null,
        subscription_status: 'trial',
      })
      .select('id')
      .single();

    if (instError || !institution) {
      setError(instError?.message ?? 'Failed to create institution');
      setLoading(false);
      return;
    }

    // 3. Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      institution_id: institution.id,
      email,
      full_name: fullName,
      role: 'admin',
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-steel flex items-center justify-center mb-4 shadow-lg">
            <Satellite className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-cream tracking-tight">Mission Control</h1>
          <p className="text-slate/50 text-sm mt-1">Set up your school library</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {(['account', 'institution'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-steel text-white' :
                step === 'institution' && s === 'account' ? 'bg-green-500 text-white' :
                'bg-white/10 text-white/40'
              }`}>{i + 1}</div>
              {i === 0 && <div className="w-8 h-0.5 bg-white/10" />}
            </div>
          ))}
          <span className="text-xs text-white/30 ml-1 capitalize">{step}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 'account' && (
              <>
                <h2 className="text-lg font-bold text-slate mb-2">Create your account</h2>
                <Input
                  label="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Thabo Nkosi"
                  required
                />
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="librarian@school.co.za"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <Button
                  type="submit"
                  disabled={!email || !password || !fullName}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              </>
            )}

            {step === 'institution' && (
              <>
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
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('account')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!institutionName || !province}
                    className="flex-1"
                    size="lg"
                  >
                    Launch
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-slate/50 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-steel font-semibold hover:underline">
              Sign in
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
