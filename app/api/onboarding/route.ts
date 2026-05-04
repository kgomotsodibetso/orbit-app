import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  // Use service role for all writes — bypasses RLS so registration works
  // regardless of email-confirmation settings (session may not exist yet).
  const service = createServiceClient();

  const body = await request.json();
  const { userId, fullName, email, institutionName, province, emisNumber, contactPhone } = body;

  const missing = ['userId','fullName','email','institutionName','province']
    .filter(k => !body[k]);
  if (missing.length) {
    console.error('[api/onboarding] missing fields:', missing, '| received:', { userId, fullName, email, institutionName, province });
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

  // Verify this userId actually exists in auth — prevents spoofed requests.
  const { data: authUser, error: authErr } = await service.auth.admin.getUserById(userId);
  if (authErr || !authUser?.user) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
  }

  // 409 guard: prevent double-submit if profile already exists.
  const { data: existingProfile } = await service
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
  }

  const baseSlug = institutionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: institution, error: instError } = await service
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

  const { error: profileError } = await service.from('profiles').insert({
    id: userId,
    institution_id: institution.id,
    email,
    full_name: fullName,
    role: 'admin',
  });

  if (profileError) {
    console.error('[api/onboarding] profile insert error:', profileError.message);
    await service.from('institutions').delete().eq('id', institution.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
