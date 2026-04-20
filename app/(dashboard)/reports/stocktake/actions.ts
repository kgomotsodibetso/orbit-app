'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function generateStocktakeReport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const month = now.getMonth() + 1;
  const term = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;

  await supabase.from('dbe_reports').insert({
    report_type: 'stocktake',
    report_year: now.getFullYear(),
    term,
    generated_by: user?.id ?? null,
  });

  redirect('/reports');
}
