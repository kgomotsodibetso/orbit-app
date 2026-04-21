import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { name, contact_email, contact_phone } = body;

  if (!name || !contact_email) {
    return NextResponse.json({ error: 'name and contact_email are required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'No institution linked to this account' }, { status: 403 });
  }

  if (!['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { error } = await supabase
    .from('institutions')
    .update({ name, contact_email, contact_phone })
    .eq('id', profile.institution_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
