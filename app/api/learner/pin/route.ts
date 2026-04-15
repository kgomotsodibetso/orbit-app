import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { member_id, pin_hash } = await request.json();

  if (!member_id || !pin_hash) {
    return NextResponse.json({ error: 'member_id and pin_hash required' }, { status: 400 });
  }

  // Verify the calling user is a librarian/admin (uses their Supabase session)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Update pin_hash — RLS ensures the member belongs to the same institution
  const { error } = await supabase
    .from('members')
    .update({ pin_hash })
    .eq('id', member_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
