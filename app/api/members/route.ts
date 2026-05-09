import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const service = createServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, member_type, grade, class_name, guardian_name, contact_phone, contact_email, notes } = body;

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 });
  }

  // Count existing members for this institution atomically on the server
  // to generate a sequential member number without a client-side race.
  const { count } = await service
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', profile.institution_id);

  const memberNumber = `ORB-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { data: member, error } = await service
    .from('members')
    .insert({
      institution_id: profile.institution_id,
      member_number:  memberNumber,
      full_name:      full_name.trim(),
      member_type:    member_type ?? 'learner',
      grade:          grade || null,
      class_name:     class_name || null,
      guardian_name:  guardian_name || null,
      contact_phone:  contact_phone || null,
      contact_email:  contact_email || null,
      notes:          notes || null,
    })
    .select('id, member_number')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(member, { status: 201 });
}