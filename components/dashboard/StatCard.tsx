import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'steel' | 'golden' | 'lavender' | 'danger';
  sub?: string;
}

const colorMap = {
  steel:    { bg: 'bg-steel/10',    text: 'text-steel',        icon: 'text-steel' },
  golden:   { bg: 'bg-golden/10',   text: 'text-amber-700',    icon: 'text-golden' },
  lavender: { bg: 'bg-lavender/10', text: 'text-indigo-700',   icon: 'text-lavender' },
  danger:   { bg: 'bg-red-50',      text: 'text-red-700',      icon: 'text-red-500' },
};

export default function StatCard({ label, value, icon: Icon, color = 'steel', sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate/10 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate">{value}</p>
      <p className="text-sm font-medium text-slate/60 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate/40 mt-1">{sub}</p>}
    </div>
  );
}
