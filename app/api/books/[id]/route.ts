import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const body = await req.json();

  // Strip immutable fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, institution_id, created_by, created_at, available_copies: _av, ...updates } = body;

  // When total_copies changes, recalculate available_copies fairly
  if (updates.total_copies !== undefined) {
    const { data: current } = await supabase
      .from('books')
      .select('total_copies, available_copies')
      .eq('id', id)
      .single();

    if (current) {
      const onLoan = current.total_copies - current.available_copies;
      // Clamp: can't set total below what's already on loan
      const newTotal = Math.max(Number(updates.total_copies), onLoan, 1);
      updates.total_copies = newTotal;
      updates.available_copies = newTotal - onLoan;
    }
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  // Block deletion if any copies are currently on loan
  const { count, error: countError } = await supabase
    .from('loans')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', id)
    .in('status', ['active', 'overdue']);

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${count} cop${count === 1 ? 'y is' : 'ies are'} currently on loan.` },
      { status: 409 }
    );
  }

  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
