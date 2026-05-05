import Link from 'next/link';
import { BookOpen, ArrowsLeftRight, Warning, UsersThree, Scan, ArrowCounterClockwise } from '@phosphor-icons/react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';

async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalBooks },
    { count: activeLoans },
    { count: overdueLoans },
    { count: totalMembers },
    { data: recentLoans },
  ] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('loans')
      .select('id, status, checked_out_at, due_date, books(title), members(full_name)')
      .order('checked_out_at', { ascending: false })
      .limit(8),
  ]);

  return {
    totalBooks: totalBooks ?? 0,
    activeLoans: activeLoans ?? 0,
    overdueLoans: overdueLoans ?? 0,
    totalMembers: totalMembers ?? 0,
    recentLoans: recentLoans ?? [],
  };
}

export default async function MissionControlPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate">Mission Control</h1>
          <p className="text-slate/50 text-sm mt-1">
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2 shrink-0">
          <Link href="/loans/checkout">
            <Button size="sm" className="gap-2">
              <Scan weight="light" className="w-3.5 h-3.5" />
              Check Out
            </Button>
          </Link>
          <Link href="/loans/return">
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowCounterClockwise weight="light" className="w-3.5 h-3.5" />
              Return
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Books"
          value={stats.totalBooks.toLocaleString()}
          icon={BookOpen}
          color="steel"
          sub="in catalogue"
        />
        <StatCard
          label="Active Loans"
          value={stats.activeLoans}
          icon={ArrowsLeftRight}
          color="golden"
          sub="currently out"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueLoans}
          icon={Warning}
          color={stats.overdueLoans > 0 ? 'danger' : 'steel'}
          sub={stats.overdueLoans > 0 ? 'need attention' : 'all on time'}
        />
        <StatCard
          label="Learners"
          value={stats.totalMembers}
          icon={UsersThree}
          color="lavender"
          sub="active members"
        />
      </div>

      {/* Overdue alert banner */}
      {stats.overdueLoans > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-start sm:items-center gap-3">
            <Warning weight="light" className="w-5 h-5 text-red-500 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm font-semibold text-red-700">
              {stats.overdueLoans} book{stats.overdueLoans > 1 ? 's are' : ' is'} overdue — SMS alerts will be sent automatically tonight.
            </p>
          </div>
          <Link href="/loans?filter=overdue" className="shrink-0 self-start sm:self-auto">
            <Button variant="danger" size="sm">View</Button>
          </Link>
        </div>
      )}

      {/* Recent activity */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RecentActivity loans={stats.recentLoans as any} />
    </div>
  );
}
