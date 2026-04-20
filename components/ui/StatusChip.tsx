import type { LoanStatus } from '@/types/database';

const config: Record<LoanStatus, { label: string; classes: string; dot: string }> = {
  active:   { label: 'Active',   classes: 'bg-steel/10 text-steel',        dot: 'bg-steel' },
  returned: { label: 'Returned', classes: 'bg-green-50 text-green-700',    dot: 'bg-green-500' },
  overdue:  { label: 'Overdue',  classes: 'bg-red-50 text-red-700',        dot: 'bg-red-500' },
  lost:     { label: 'Lost',     classes: 'bg-slate/10 text-slate/60',     dot: 'bg-slate/40' },
};

export default function StatusChip({ status }: { status: LoanStatus }) {
  const { label, classes, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
