import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const memberId = request.cookies.get('orbit_learner_session')?.value;
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Learners have no Supabase session — use service client and scope by member UUID.
  const supabase = createServiceClient();
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
