import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error('[auth/callback] exchangeCodeForSession error:', sessionError.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?error=oauth_failed`);

  // All profile/institution checks and creation use the service role so RLS
  // never interferes — a new OAuth user has no JWT claims yet.
  const service = createServiceClient();

  const { data: existingProfile } = await service
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  // Returning user — nothing to create.
  if (existingProfile) return NextResponse.redirect(`${origin}/`);

  // ── New user: create institution + profile right here, server-side. ───────
  // We do this in the callback so the user NEVER reaches any page without a
  // profile. No client-side inserts, no RLS dependency, no limbo state.
  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Admin';

  const email = user.email ?? '';

  const baseSlug = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: institution, error: instError } = await service
    .from('institutions')
    .insert({
      name: fullName,
      slug,
      tier: 1,
      type: 'school',
      province: null,
      contact_email: email,
      subscription_status: 'trial',
    })
    .select('id')
    .single();

  if (instError || !institution) {
    console.error('[auth/callback] institution insert error:', instError?.message);
    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
  }

  const { error: profileError } = await service.from('profiles').insert({
    id: user.id,
    institution_id: institution.id,
    email,
    full_name: fullName,
    role: 'admin',
  });

  if (profileError) {
    console.error('[auth/callback] profile insert error:', profileError.message);
    // Clean up the orphaned institution so the user can retry.
    await service.from('institutions').delete().eq('id', institution.id);
    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
  }

  // Profile created — send them to settings to fill in their school details.
  return NextResponse.redirect(`${origin}/settings?welcome=1`);
}
