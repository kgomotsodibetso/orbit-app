import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: books } = await supabase
    .from('books')
    .select('id, isbn_13, title, authors, total_copies, condition, acquisition_date, acquisition_source, acquisition_cost, location_shelf')
    .not('acquisition_cost', 'is', null)
    .order('acquisition_date', { ascending: true });

  const totalValue = books?.reduce((sum, b) => sum + (b.acquisition_cost ?? 0) * b.total_copies, 0) ?? 0;

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total_titles: books?.length ?? 0,
    total_value_zar: totalValue,
    books: books ?? [],
  });
}
