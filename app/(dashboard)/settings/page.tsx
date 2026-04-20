import { Building2, User, CreditCard, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import InstitutionForm from './InstitutionForm';

const tierLabels: Record<number, { label: string; colour: string }> = {
  1: { label: 'Tier 1 — Paid',       colour: 'bg-steel/10 text-steel border-steel/20' },
  2: { label: 'Tier 2 — CSI',        colour: 'bg-lavender/10 text-indigo-700 border-lavender/30' },
  3: { label: 'Tier 3 — Free Public', colour: 'bg-green-50 text-green-700 border-green-200' },
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: institution }, { data: profile }, { count: bookCount }, { count: memberCount }] =
    await Promise.all([
      supabase.from('institutions').select('*').single(),
      user
        ? supabase.from('profiles').select('*').eq('id', user.id).single()
        : Promise.resolve({ data: null }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

  const tier = institution?.tier ?? 3;
  const tierInfo = tierLabels[tier] ?? tierLabels[3];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate">Settings</h1>
        <p className="text-slate/50 text-sm mt-0.5">Manage your institution profile and account</p>
      </div>

      {/* Institution profile */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-slate/40" />
          <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest">
            Institution Profile
          </h2>
        </div>

        {institution ? (
          <InstitutionForm institution={institution} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate/10 p-6 text-center text-sm text-slate/40">
            Institution record not found.
          </div>
        )}
      </section>

      {/* Subscription & limits */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-slate/40" />
          <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest">
            Subscription
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate">Plan</p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierInfo.colour}`}>
              {tierInfo.label}
            </span>
          </div>

          {institution?.subscription_ends_at && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate/60">Renews</p>
              <p className="text-sm font-medium text-slate">
                {new Date(institution.subscription_ends_at).toLocaleDateString('en-ZA')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate/60">Status</p>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                institution?.subscription_status === 'active'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {institution?.subscription_status ?? '—'}
            </span>
          </div>

          <div className="border-t border-slate/10 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate/40 mb-1">Books used</p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-slate">{bookCount ?? 0}</span>
                <span className="text-sm text-slate/40 mb-0.5">/ {institution?.max_books ?? '—'}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-steel transition-all"
                  style={{
                    width: institution?.max_books
                      ? `${Math.min(100, ((bookCount ?? 0) / institution.max_books) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate/40 mb-1">Members used</p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-slate">{memberCount ?? 0}</span>
                <span className="text-sm text-slate/40 mb-0.5">/ {institution?.max_members ?? '—'}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lavender transition-all"
                  style={{
                    width: institution?.max_members
                      ? `${Math.min(100, ((memberCount ?? 0) / institution.max_members) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your account */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-slate/40" />
          <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest">
            Your Account
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate/10 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Name</p>
              <p className="text-sm font-medium text-slate">{profile?.full_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-medium text-slate truncate">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Role</p>
              <p className="text-sm font-medium text-slate capitalize">{profile?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Phone</p>
              <p className="text-sm font-medium text-slate">{profile?.phone ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate/5 border border-slate/10">
        <Shield className="w-4 h-4 text-slate/30 mt-0.5 shrink-0" />
        <p className="text-xs text-slate/40 leading-relaxed">
          To change your password or email address, use the password reset flow from the login page.
          All data is stored in South Africa and protected under POPIA.
        </p>
      </div>
    </div>
  );
}
