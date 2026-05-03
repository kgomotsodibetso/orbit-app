import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email';
import { checkoutEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();
  const { book_id, member_id } = body as { book_id: string; member_id: string };

  if (!book_id || !member_id) {
    return NextResponse.json({ error: 'book_id and member_id are required' }, { status: 400 });
  }

  // Use service client for all writes — bypasses RLS so no JWT-claim setup required
  const service = createServiceClient();

  // 1. Verify book is available
  const { data: book } = await service
    .from('books')
    .select('id, title, institution_id, available_copies, is_reference_only')
    .eq('id', book_id)
    .single();

  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  if (book.is_reference_only) return NextResponse.json({ error: 'Reference-only book cannot be checked out' }, { status: 400 });
  if (book.available_copies < 1) return NextResponse.json({ error: 'No copies available' }, { status: 409 });

  // 2. Verify member has loan capacity
  const { data: member } = await service
    .from('members')
    .select('id, full_name, max_loans, loan_period_days, is_active')
    .eq('id', member_id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (!member.is_active) return NextResponse.json({ error: 'Member account is inactive' }, { status: 400 });

  const { count: activeLoans } = await service
    .from('loans')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', member_id)
    .in('status', ['active', 'overdue']);

  if ((activeLoans ?? 0) >= member.max_loans) {
    return NextResponse.json({ error: 'Member has reached their loan limit' }, { status: 409 });
  }

  // 3. Atomically decrement available_copies (optimistic lock — only succeeds if still > 0)
  const { error: decrementError, count: decremented } = await service
    .from('books')
    .update({ available_copies: book.available_copies - 1 })
    .eq('id', book_id)
    .eq('available_copies', book.available_copies) // ensures no race between check and update
    .gt('available_copies', 0);

  if (decrementError || decremented === 0) {
    return NextResponse.json({ error: 'No copies available' }, { status: 409 });
  }

  // 4. Insert loan
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (member.loan_period_days ?? 14));

  const { data: loan, error: loanError } = await service
    .from('loans')
    .insert({
      institution_id: book.institution_id,
      book_id,
      member_id,
      checked_out_by: user.id,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'active',
    })
    .select()
    .single();

  if (loanError) {
    // Rollback the decrement so available_copies is consistent
    await service
      .from('books')
      .update({ available_copies: book.available_copies })
      .eq('id', book_id);

    console.error('[Checkout] loan insert failed:', loanError);
    return NextResponse.json({ error: loanError.message }, { status: 500 });
  }

  // 5. Checkout confirmation email (best-effort)
  void (async () => {
    try {
      const [{ data: memberFull }, { data: inst }] = await Promise.all([
        service.from('members').select('contact_email').eq('id', member_id).single(),
        service.from('institutions').select('name, settings').eq('id', book.institution_id).single(),
      ]);
      const notifPrefs = ((inst?.settings as Record<string, unknown>)?.notifications ?? {}) as Record<string, boolean>;
      if (memberFull?.contact_email && notifPrefs.emailCheckout !== false) {
        await sendEmail({
          to:      memberFull.contact_email,
          subject: `Checked Out: ${book.title}`,
          html:    checkoutEmail({
            schoolName: inst?.name ?? 'Your School',
            memberName: member.full_name,
            bookTitle:  book.title,
            authors:    '',
            dueDate:    new Date(loan.due_date).toLocaleDateString('en-ZA'),
          }),
        });
      }
    } catch (e) {
      console.warn('[Checkout] email failed:', e);
    }
  })();

  // 6. Audit log (best-effort — don't fail the whole request if this errors)
  await service.from('audit_log').insert({
    institution_id: book.institution_id,
    performed_by: user.id,
    action: 'loan_created',
    table_name: 'loans',
    record_id: loan.id,
    new_values: { book_id, member_id, due_date: loan.due_date },
  }).then(({ error }) => {
    if (error) console.warn('[Checkout] audit_log insert failed:', error.message);
  });

  return NextResponse.json(loan, { status: 201 });
}
