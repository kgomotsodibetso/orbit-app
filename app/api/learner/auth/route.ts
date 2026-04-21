import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: NextRequest) {
  const { member_number, pin } = await request.json();

  if (!member_number || !pin) {
    return NextResponse.json({ error: 'Member number and PIN required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: member } = await supabase
    .from('members')
    .select('id, full_name, pin_hash, is_active')
    .eq('member_number', member_number.toUpperCase().trim())
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 401 });
  }

  if (!member.is_active) {
    return NextResponse.json({ error: 'This account is inactive' }, { status: 403 });
  }

  if (!member.pin_hash) {
    return NextResponse.json(
      { error: 'No PIN set for this account. Ask your librarian to set one.' },
      { status: 403 }
    );
  }

  if (member.pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('orbit_learner_session', member.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('orbit_learner_session');
  return response;
}
