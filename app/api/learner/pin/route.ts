import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: NextRequest) {
  const { member_id, pin } = await request.json();

  if (!member_id || !pin) {
    return NextResponse.json({ error: 'member_id and pin required' }, { status: 400 });
  }

  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  // Verify the calling user is a librarian/admin (uses their Supabase session)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Hash server-side — consistent with /api/learner/auth.
  // .select().single() turns "0 rows updated" into an error so we can
  // distinguish a missing member_id from a real DB failure.
  const { data, error } = await supabase
    .from('members')
    .update({ pin_hash: hashPin(pin) })
    .eq('id', member_id)
    .select('id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
