import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import DashboardShell from '@/components/ui/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Use service client so RLS doesn't block the profile lookup for new users
  // whose JWT claims haven't been populated yet.
  const service = createServiceClient();
  const { data: profile } = await service
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/setup');

  return <DashboardShell>{children}</DashboardShell>;
}
