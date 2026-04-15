import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();
  const { book_id, member_id } = body as { book_id: string; member_id: string };

  if (!book_id || !member_id) {
    return NextResponse.json({ error: 'book_id and member_id are required' }, { status: 400 });
  }

  // 1. Verify book is available
  const { data: book } = await supabase
    .from('books')
    .select('id, title, available_copies, is_reference_only')
    .eq('id', book_id)
    .single();

  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  if (book.is_reference_only) return NextResponse.json({ error: 'Reference-only book cannot be checked out' }, { status: 400 });
  if (book.available_copies < 1) return NextResponse.json({ error: 'No copies available' }, { status: 409 });

  // 2. Verify member has loan capacity
  const { data: member } = await supabase
    .from('members')
    .select('id, full_name, max_loans, loan_period_days, is_active')
    .eq('id', member_id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (!member.is_active) return NextResponse.json({ error: 'Member account is inactive' }, { status: 400 });

  const { count: activeLoans } = await supabase
    .from('loans')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', member_id)
    .in('status', ['active', 'overdue']);

  if ((activeLoans ?? 0) >= member.max_loans) {
    return NextResponse.json({ error: 'Member has reached their loan limit' }, { status: 409 });
  }

  // 3. Get librarian profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, institution_id')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + member.loan_period_days);

  // 4. Create loan + decrement available_copies (in one transaction via RPC ideally)
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .insert({
      institution_id: profile.institution_id,
      book_id,
      member_id,
      checked_out_by: user.id,
      checked_out_at: new Date().toISOString(),
      due_date: dueDate.toISOString().split('T')[0],
      status: 'active',
    })
    .select()
    .single();

  if (loanError) {
    console.error('[Checkout]', loanError);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }

  await supabase
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', book_id);

  // 5. Audit log
  await supabase.from('audit_log').insert({
    institution_id: profile.institution_id,
    performed_by: user.id,
    action: 'loan_created',
    table_name: 'loans',
    record_id: loan.id,
    new_values: { book_id, member_id, due_date: loan.due_date },
  });

  return NextResponse.json(loan, { status: 201 });
}
