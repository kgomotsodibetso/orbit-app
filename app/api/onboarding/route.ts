import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const service = createServiceClient();

  // Parse body — guard against empty/malformed body caused by middleware
  // body-stream issues in Next.js 16.
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    console.error('[api/onboarding] failed to parse request body');
  }

  const { fullName, email, institutionName, province, emisNumber, contactPhone } =
    body as {
      fullName?: string;
      email?: string;
      institutionName?: string;
      province?: string;
      emisNumber?: string | null;
      contactPhone?: string | null;
    };

  // ── Identify the user ─────────────────────────────────────────────────────
  // Primary source: the authenticated session cookie (set by Supabase after
  // signUp when email confirmation is disabled).
  // Fallback: userId in the request body (used when email confirmation is
  // enabled and no session cookie exists yet).
  // This makes the route robust regardless of whether the body was stripped
  // by the middleware or the client failed to serialise the userId field.
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (sessionUser?.id) userId = sessionUser.id;
  } catch {
    // Session read failed — fall through to body fallback
  }

  if (!userId && body.userId && typeof body.userId === 'string') {
    const { data: verified } = await service.auth.admin.getUserById(body.userId);
    if (verified?.user?.id) userId = verified.user.id;
  }

  if (!userId) {
    console.error('[api/onboarding] could not identify user — no session and no valid userId in body');
    return NextResponse.json(
      { error: 'Not authenticated. Please sign in and try again.' },
      { status: 401 },
    );
  }

  // ── Validate required form fields ─────────────────────────────────────────
  const missingFields = (['fullName', 'email', 'institutionName', 'province'] as const)
    .filter(k => !body[k]);

  if (missingFields.length) {
    console.error('[api/onboarding] missing fields:', missingFields);
    return NextResponse.json(
      { error: `Please fill in all required fields: ${missingFields.join(', ')}` },
      { status: 400 },
    );
  }

  // ── Guard: profile already exists ─────────────────────────────────────────
  const { data: existingProfile } = await service
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
  }

  // ── Create institution ─────────────────────────────────────────────────────
  const baseSlug = (institutionName as string)
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
      { status: 500 },
    );
  }

  // ── Create profile ─────────────────────────────────────────────────────────
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
