import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const service = createServiceClient();

  const { data: currentProfile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!currentProfile?.institution_id) {
    return NextResponse.json({ members: [] });
  }

  const { data: members, error } = await service
    .from('profiles')
    .select('id, full_name, email, role, is_active, avatar_url, last_login_at, created_at')
    .eq('institution_id', currentProfile.institution_id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ members: members ?? [] });
}
