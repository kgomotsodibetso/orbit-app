import Link from 'next/link';
import { AlertCircle, ArrowLeftRight, BookOpen, CheckCircle2, Clock, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';

type LoanFilter = 'active' | 'overdue' | 'today' | 'all';

type LoanRow = {
  id: string;
  status: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  fine_amount: number | null;
  fine_paid: boolean;
  books: { id: string; title: string; isbn_13: string | null } | null;
  members: {
    id: string;
    full_name: string;
    member_number: string;
    grade: string | null;
    class_name: string | null;
  } | null;
};

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = 'active' } = await searchParams;
  const supabase = await createClient();

  // Fetch active + overdue loans with book and member info
  const { data: rawLoans } = await supabase
    .from('loans')
    .select(
      'id, status, due_date, checked_out_at, returned_at, fine_amount, fine_paid, ' +
      'books(id, title, isbn_13), ' +
      'members(id, full_name, member_number, grade, class_name)'
    )
    .in('status', ['active', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(200);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const loans = (rawLoans ?? []) as unknown as LoanRow[];

  // Compute stats
  const overdueLoans = loans.filter((l) => l.status === 'overdue');
  const dueTodayLoans = loans.filter((l) => {
    const due = new Date(l.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  });

  // Apply filter
  const filtered = (() => {
    if (filter === 'overdue') return overdueLoans;
    if (filter === 'today') return dueTodayLoans;
    if (filter === 'all') return loans;
    // default: 'active' = non-overdue active loans only
    return loans.filter((l) => l.status === 'active');
  })();

  const tabs: { key: LoanFilter; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: loans.filter((l) => l.status === 'active').length },
    { key: 'overdue', label: 'Overdue', count: overdueLoans.length },
    { key: 'today', label: 'Due Today', count: dueTodayLoans.length },
    { key: 'all', label: 'All', count: loans.length },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate">Loans</h1>
          <p className="text-slate/50 text-sm mt-0.5">Track active checkouts and overdue returns</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/loans/return"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-xl bg-cream text-slate border border-slate/20 hover:bg-cream/80 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Return
          </Link>
          <Link
            href="/loans/checkout"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-xl btn-primary transition-all"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <Plus className="w-4 h-4" />
            Check Out
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-steel/10 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 text-steel" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate">{loans.length}</p>
              <p className="text-xs text-slate/50">Total Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{overdueLoans.length}</p>
              <p className="text-xs text-slate/50">Overdue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-golden/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-golden/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-golden" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate">{dueTodayLoans.length}</p>
              <p className="text-xs text-slate/50">Due Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="overflow-x-auto mb-4">
      <div className="flex gap-1 bg-slate/5 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
        {tabs.map(({ key, label, count }) => (
          <Link
            key={key}
            href={`/loans?filter=${key}`}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5',
              filter === key
                ? 'bg-white text-slate shadow-sm'
                : 'text-slate/50 hover:text-slate',
            ].join(' ')}
          >
            {label}
            {count > 0 && (
              <span
                className={[
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  key === 'overdue' && count > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-slate/10 text-slate/60',
                ].join(' ')}
              >
                {count}
              </span>
            )}
          </Link>
        ))}
      </div>
      </div>

      {/* Loans table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate/10 p-16 text-center">
          <BookOpen className="w-10 h-10 text-slate/20 mx-auto mb-3" />
          <p className="text-slate/50 font-medium">No loans to show</p>
          <p className="text-sm text-slate/30 mt-1">
            {filter === 'overdue' ? 'No overdue books — great!' : 'Switch tabs or check out a book.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate/10 bg-cream/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                  Learner
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                  Book
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden md:table-cell">
                  Checked Out
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                  Due Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/5">
              {filtered.map((loan) => {
                const dueDate = new Date(loan.due_date);
                dueDate.setHours(0, 0, 0, 0);
                const diffMs = dueDate.getTime() - today.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                const isOverdue = loan.status === 'overdue' || diffDays < 0;
                const isDueToday = diffDays === 0;

                return (
                  <tr key={loan.id} className={isOverdue ? 'bg-red-50/40' : ''}>
                    {/* Member */}
                    <td className="px-5 py-3">
                      {loan.members ? (
                        <Link
                          href={`/learners/${loan.members.id}`}
                          className="hover:text-steel transition-colors"
                        >
                          <p className="text-sm font-semibold text-slate">{loan.members.full_name}</p>
                          <p className="text-xs text-slate/40">
                            {loan.members.member_number}
                            {loan.members.grade ? ` · Gr ${loan.members.grade}` : ''}
                            {loan.members.class_name ? ` ${loan.members.class_name}` : ''}
                          </p>
                        </Link>
                      ) : (
                        <span className="text-sm text-slate/30">—</span>
                      )}
                    </td>

                    {/* Book */}
                    <td className="px-5 py-3">
                      {loan.books ? (
                        <Link
                          href={`/catalogue/${loan.books.id}`}
                          className="hover:text-steel transition-colors"
                        >
                          <p className="text-sm font-medium text-slate truncate max-w-[200px]">
                            {loan.books.title}
                          </p>
                          {loan.books.isbn_13 && (
                            <p className="text-xs text-slate/40">{loan.books.isbn_13}</p>
                          )}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate/30">—</span>
                      )}
                    </td>

                    {/* Checked out date */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate/50">
                        {new Date(loan.checked_out_at).toLocaleDateString('en-ZA')}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="px-5 py-3">
                      <p
                        className={[
                          'text-sm font-medium',
                          isOverdue ? 'text-red-600' : isDueToday ? 'text-golden' : 'text-slate',
                        ].join(' ')}
                      >
                        {new Date(loan.due_date).toLocaleDateString('en-ZA')}
                      </p>
                      <p className={[
                        'text-xs',
                        isOverdue ? 'text-red-400' : isDueToday ? 'text-golden/70' : 'text-slate/40',
                      ].join(' ')}>
                        {isOverdue
                          ? `${Math.abs(diffDays)}d overdue`
                          : isDueToday
                          ? 'Due today'
                          : `${diffDays}d left`}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3">
                      {isOverdue ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : isDueToday ? (
                        <Badge variant="warning">Due Today</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {filtered.length >= 200 && (
            <div className="px-5 py-3 border-t border-slate/10 bg-cream/40 text-center">
              <p className="text-xs text-slate/40">Showing first 200 loans. Use filters to narrow down.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
