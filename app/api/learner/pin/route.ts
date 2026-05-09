import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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

  // Use service client for the write so the update is never blocked by RLS
  // edge cases. The caller's identity has already been verified above.
  const service = createServiceClient();
  const { data, error } = await service
    .from('members')
    .update({ pin_hash: hashPin(pin) })
    .eq('id', member_id)
    .select('id, pin_hash')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Verify the hash was actually written (guards against schema cache issues
  // where PostgREST silently ignores body fields it doesn't recognise)
  if (!data?.pin_hash) {
    console.error('[learner/pin] pin_hash column missing or not written — run migration 005');
    return NextResponse.json(
      { error: 'PIN could not be saved. Contact your administrator.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
