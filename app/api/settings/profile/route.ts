import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { full_name, phone } = await request.json();
  if (!full_name?.trim()) return NextResponse.json({ error: 'full_name is required' }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service
    .from('profiles')
    .update({ full_name: full_name.trim(), phone: phone?.trim() || null })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
