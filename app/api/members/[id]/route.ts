import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'No institution linked' }, { status: 403 });
  }

  const body = await request.json();
  const {
    full_name,
    member_type,
    grade,
    class_name,
    guardian_name,
    contact_phone,
    contact_email,
    notes,
    is_active,
  } = body;

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 });
  }

  // Scope update to the institution — prevents cross-tenant writes
  const { error } = await supabase
    .from('members')
    .update({
      full_name: full_name.trim(),
      member_type,
      grade: grade || null,
      class_name: class_name || null,
      guardian_name: guardian_name || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      notes: notes || null,
      is_active: typeof is_active === 'boolean' ? is_active : undefined,
    })
    .eq('id', id)
    .eq('institution_id', profile.institution_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
