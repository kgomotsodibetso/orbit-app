import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import LearnerPortalClient from './LearnerPortalClient';

export default async function LearnerDashboardPage() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('orbit_learner_session')?.value;
  if (!memberId) redirect('/learner/login');

  const supabase = createServiceClient();

  const [{ data: member }, { data: loans }] = await Promise.all([
    supabase
      .from('members')
      .select('id, full_name, member_number, grade, class_name, max_loans, institution_id')
      .eq('id', memberId)
      .single(),
    supabase
      .from('loans')
      .select('id, status, due_date, checked_out_at, returned_at, books(id, title, cover_url, authors)')
      .eq('member_id', memberId)
      .order('checked_out_at', { ascending: false })
      .limit(30),
  ]);

  if (!member) redirect('/learner/login');

  const { data: books } = await supabase
    .from('books')
    .select('id, title, authors, subject_area, available_copies')
    .eq('institution_id', member.institution_id)
    .gt('available_copies', 0)
    .order('title')
    .limit(20);

  return (
    <LearnerPortalClient
      member={member}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loans={(loans ?? []) as any}
      books={books ?? []}
    />
  );
}
