import { createClient } from '@/lib/supabase/server';
import SettingsTabs from './SettingsTabs';

const tierLabels: Record<number, { label: string; colour: string }> = {
  1: { label: 'Tier 1 — Paid',        colour: 'bg-steel/10 text-steel border-steel/20' },
  2: { label: 'Tier 2 — CSI',         colour: 'bg-lavender/10 text-indigo-700 border-lavender/30' },
  3: { label: 'Tier 3 — Free Public', colour: 'bg-green-50 text-green-700 border-green-200' },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const isWelcome = params.welcome === '1';

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: institution }, { data: profile }, { count: bookCount }, { count: memberCount }] =
    await Promise.all([
      supabase.from('institutions').select('*').single(),
      user
        ? supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

  const tier     = institution?.tier ?? 3;
  const tierInfo = tierLabels[tier] ?? tierLabels[3];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate">Settings</h1>
        <p className="text-slate/50 text-sm mt-0.5">Manage your profile, school, and preferences</p>
      </div>

      {isWelcome && (
        <div className="mb-6 px-4 py-4 bg-steel/10 border border-steel/20 rounded-2xl">
          <p className="text-sm font-semibold text-steel">Welcome to Orbit! 🎉</p>
          <p className="text-sm text-slate/70 mt-0.5">
            Your account is ready. Please update your school name and province below — we used your Google name as a placeholder.
          </p>
        </div>
      )}

      <SettingsTabs
        institution={institution ?? null}
        profile={profile ?? null}
        userEmail={user?.email ?? null}
        bookCount={bookCount ?? 0}
        memberCount={memberCount ?? 0}
        tierInfo={tierInfo}
      />
    </div>
  );
}
