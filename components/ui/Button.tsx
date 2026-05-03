'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'bg-cream text-slate border border-slate/20 hover:bg-cream/80 active:bg-cream/60',
  ghost:     'bg-transparent text-steel hover:bg-steel/10 active:bg-steel/20',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        // Inline styles are applied before any stylesheet — guaranteed to work
        // even before CSS loads. touchAction kills the 300 ms mobile tap delay.
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold',
          'cursor-pointer select-none',
          'transition-[background-color,border-color,color,box-shadow,opacity] duration-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2',
          // opacity only — no pointer-events manipulation which can misfire in Tailwind v4
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
