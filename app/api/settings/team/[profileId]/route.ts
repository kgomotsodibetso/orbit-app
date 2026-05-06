import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  if (profileId === user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: currentProfile } = await service
    .from('profiles')
    .select('institution_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!currentProfile?.institution_id) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  if (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only admins can remove staff members' }, { status: 403 });
  }

  // Verify target profile belongs to same institution
  const { data: targetProfile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', profileId)
    .maybeSingle();

  if (!targetProfile || targetProfile.institution_id !== currentProfile.institution_id) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  }

  const { error } = await service
    .from('profiles')
    .update({ is_active: false })
    .eq('id', profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const service = createServiceClient();

  const { data: currentProfile } = await service
    .from('profiles')
    .select('institution_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!currentProfile?.institution_id) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  if (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only admins can update staff members' }, { status: 403 });
  }

  const { data: targetProfile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', profileId)
    .maybeSingle();

  if (!targetProfile || targetProfile.institution_id !== currentProfile.institution_id) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  }

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  if (body.role) allowed.role = body.role;
  if (typeof body.is_active === 'boolean') allowed.is_active = body.is_active;

  const { error } = await service
    .from('profiles')
    .update(allowed)
    .eq('id', profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
