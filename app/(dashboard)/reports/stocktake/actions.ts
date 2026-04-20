'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function generateStocktakeReport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const now = new Date();
  const month = now.getMonth() + 1;
  const term = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;

  const { error } = await supabase.from('dbe_reports').insert({
    institution_id: profile.institution_id,
    report_type: 'stocktake',
    report_year: now.getFullYear(),
    term,
    generated_by: user.id,
  });

  if (error) throw new Error(error.message);

  redirect('/reports');
}
