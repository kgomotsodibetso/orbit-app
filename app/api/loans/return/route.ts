import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();
  const { loan_id, condition_on_return } = body as {
    loan_id: string;
    condition_on_return?: 'good' | 'damaged' | 'lost';
  };

  if (!loan_id) {
    return NextResponse.json({ error: 'loan_id is required' }, { status: 400 });
  }

  // 1. Get the active loan
  const { data: loan } = await supabase
    .from('loans')
    .select('id, book_id, status, institution_id')
    .eq('id', loan_id)
    .in('status', ['active', 'overdue'])
    .single();

  if (!loan) return NextResponse.json({ error: 'Active loan not found' }, { status: 404 });

  const isLost = condition_on_return === 'lost';

  // 2. Atomically update loan status and restore available_copies via RPC.
  // The DB function handles both writes in one transaction.
  const { data: returnedRows, error: returnError } = await supabase.rpc('return_book', {
    p_loan_id: loan_id,
    p_checked_in_by: user.id,
    p_condition: condition_on_return ?? 'good',
  });

  if (returnError) {
    console.error('[Return]', returnError);
    return NextResponse.json({ error: 'Failed to process return' }, { status: 500 });
  }

  const updatedLoan = returnedRows?.[0];

  // 4. Audit log
  await supabase.from('audit_log').insert({
    institution_id: loan.institution_id,
    performed_by: user.id,
    action: isLost ? 'loan_lost' : 'loan_returned',
    table_name: 'loans',
    record_id: loan_id,
    new_values: { status: updatedLoan.status, condition_on_return },
  });

  return NextResponse.json(updatedLoan);
}
