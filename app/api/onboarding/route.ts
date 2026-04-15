import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Must be authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // 409 guard: prevent double-submit if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
  }

  const body = await request.json();
  const { fullName, email, institutionName, province, emisNumber, contactPhone } = body;

  if (!fullName || !email || !institutionName || !province) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate slug
  const baseSlug = institutionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  // Create institution
  const { data: institution, error: instError } = await supabase
    .from('institutions')
    .insert({
      name: institutionName,
      slug,
      tier: emisNumber ? 3 : 1,
      type: 'school',
      province,
      emis_number: emisNumber ?? null,
      contact_email: email,
      contact_phone: contactPhone ?? null,
      subscription_status: 'trial',
    })
    .select('id')
    .single();

  if (instError || !institution) {
    console.error('[api/onboarding] institution insert error:', instError?.message);
    return NextResponse.json(
      { error: instError?.message ?? 'Failed to create institution' },
      { status: 500 }
    );
  }

  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    institution_id: institution.id,
    email,
    full_name: fullName,
    role: 'admin',
  });

  if (profileError) {
    console.error('[api/onboarding] profile insert error:', profileError.message);
    // Rollback orphaned institution
    await supabase.from('institutions').delete().eq('id', institution.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
