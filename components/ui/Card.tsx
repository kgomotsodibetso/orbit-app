import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'dark';
}

export default function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  const base = 'rounded-2xl p-5 transition-shadow';
  const variants = {
    default: 'bg-white border border-slate/10 shadow-sm hover:shadow-md',
    glass: 'glass-card text-white',
    dark: 'bg-slate text-cream border border-white/10',
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
