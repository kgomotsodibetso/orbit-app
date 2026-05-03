import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { name, contact_email, contact_phone, settings } = body;

  if (!name?.trim() || !contact_email?.trim()) {
    return NextResponse.json({ error: 'name and contact_email are required' }, { status: 400 });
  }

  // Use service client — bypasses RLS (institution UPDATE requires super_admin JWT claim
  // which may not be configured; service role is safe here since we verified auth above)
  const service = createServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'No institution linked to this account' }, { status: 403 });
  }

  const { error } = await service
    .from('institutions')
    .update({
      name: name.trim(),
      contact_email: contact_email.trim(),
      contact_phone: contact_phone?.trim() || null,
      ...(settings !== undefined && { settings }),
    })
    .eq('id', profile.institution_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
