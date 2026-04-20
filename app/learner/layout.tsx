import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Librarians who land on any /learner/* route are redirected to member management
  if (user) redirect('/learners');

  return (
    <div className="min-h-screen bg-cream">
      {children}
    </div>
  );
}
