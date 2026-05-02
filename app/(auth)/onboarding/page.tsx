import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingForm from './OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createClient();

  // Guard 1: must be authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Guard 2: if profile already exists, skip onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    redirect('/');
  }

  return (
    <OnboardingForm
      defaultName={user.user_metadata?.full_name ?? ''}
      defaultEmail={user.email ?? ''}
    />
  );
}
