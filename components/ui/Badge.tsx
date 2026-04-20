type BadgeVariant = 'steel' | 'golden' | 'lavender' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  steel:    'bg-steel/10 text-steel border-steel/20',
  golden:   'bg-golden/10 text-amber-700 border-golden/30',
  lavender: 'bg-lavender/10 text-indigo-700 border-lavender/30',
  success:  'bg-green-50 text-green-700 border-green-200',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  danger:   'bg-red-50 text-red-700 border-red-200',
  neutral:  'bg-slate/10 text-slate border-slate/20',
};

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
