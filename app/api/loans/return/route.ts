import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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

  const service = createServiceClient();

  // 1. Get the active loan
  const { data: loan } = await service
    .from('loans')
    .select('id, book_id, status, institution_id')
    .eq('id', loan_id)
    .in('status', ['active', 'overdue'])
    .single();

  if (!loan) return NextResponse.json({ error: 'Active loan not found' }, { status: 404 });

  const isLost = condition_on_return === 'lost';

  // 2. Mark loan as returned / lost
  const { data: updatedLoan, error: loanError } = await service
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

  if (loanError) {
    console.error('[Return] loan update failed:', loanError);
    return NextResponse.json({ error: loanError.message }, { status: 500 });
  }

  // 3. Restore available_copies unless the book is marked lost
  if (!isLost) {
    const { data: book } = await service
      .from('books')
      .select('available_copies')
      .eq('id', loan.book_id)
      .single();

    if (book) {
      await service
        .from('books')
        .update({ available_copies: book.available_copies + 1 })
        .eq('id', loan.book_id);
    }
  }

  // 4. Audit log (best-effort)
  await service.from('audit_log').insert({
    institution_id: loan.institution_id,
    performed_by: user.id,
    action: isLost ? 'loan_lost' : 'loan_returned',
    table_name: 'loans',
    record_id: loan_id,
    new_values: { status: updatedLoan.status, condition_on_return },
  }).then(({ error }) => {
    if (error) console.warn('[Return] audit_log insert failed:', error.message);
  });

  return NextResponse.json(updatedLoan);
}
