import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const memberId = request.cookies.get('orbit_learner_session')?.value;
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('members')
    .select('id, full_name, member_number, grade, class_name, member_type, max_loans')
    .eq('id', memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  return NextResponse.json(member);
}
