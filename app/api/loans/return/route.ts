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

  // 2. Update loan record
  const { data: updatedLoan, error: updateError } = await supabase
    .from('loans')
    .update({
      status: isLost ? 'lost' : 'returned',
      returned_at: new Date().toISOString(),
      checked_in_by: user.id,
      condition_on_return: condition_on_return ?? 'good',
    })
    .eq('id', loan_id)
    .select()
    .single();

  if (updateError) {
    console.error('[Return]', updateError);
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }

  // 3. Restore available_copies (unless lost)
  if (!isLost) {
    const { data: book } = await supabase
      .from('books')
      .select('available_copies')
      .eq('id', loan.book_id)
      .single();

    if (book) {
      await supabase
        .from('books')
        .update({ available_copies: book.available_copies + 1 })
        .eq('id', loan.book_id);
    }
  }

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
