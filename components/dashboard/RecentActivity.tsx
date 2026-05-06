import StatusChip from '@/components/ui/StatusChip';
import type { LoanStatus } from '@/types/database';

interface LoanRow {
  id: string;
  status: LoanStatus;
  checked_out_at: string;
  due_date: string;
  books: { title: string } | null;
  members: { full_name: string } | null;
}

export default function RecentActivity({ loans }: { loans: LoanRow[] }) {
  if (!loans.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate/10 p-8 text-center">
        <p className="text-slate/40 text-sm">No recent loan activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate/10 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate/10">
        <h2 className="font-semibold text-slate text-sm">Recent Activity</h2>
      </div>
      <ul className="divide-y divide-slate/5">
        {loans.map((loan, i) => (
          <li
            key={loan.id}
            className="stagger-item flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors"
            style={{ '--stagger-i': i } as React.CSSProperties}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate truncate">
                {loan.books?.title ?? '—'}
              </p>
              <p className="text-xs text-slate/50 truncate">
                {loan.members?.full_name ?? '—'} · Due {loan.due_date}
              </p>
            </div>
            <StatusChip status={loan.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
