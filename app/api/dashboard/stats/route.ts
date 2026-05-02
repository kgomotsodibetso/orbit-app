import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const [
    { count: totalBooks },
    { count: activeLoans },
    { count: overdueLoans },
    { count: totalMembers },
    { data: recentLoans },
  ] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('loans')
      .select('id, status, checked_out_at, due_date, books(title), members(full_name)')
      .order('checked_out_at', { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    totalBooks: totalBooks ?? 0,
    activeLoans: activeLoans ?? 0,
    overdueLoans: overdueLoans ?? 0,
    totalMembers: totalMembers ?? 0,
    recentLoans: recentLoans ?? [],
  });
}
