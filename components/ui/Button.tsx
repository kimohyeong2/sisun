import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
  const baseClass =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-notion-blue/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap';

  const sizeClasses: Record<Size, string> = {
    md: 'h-9 px-4 text-sm gap-1.5',
    sm: 'h-8 px-3 text-xs gap-1',
  };

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-notion-blue text-white hover:bg-notion-blue-active rounded-full shadow-sm',
    outline: 'border border-notion-hairline bg-white hover:bg-notion-canvas-soft text-notion-ink rounded-notion-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
    ghost: 'hover:bg-notion-canvas-soft text-notion-ink-secondary rounded-notion-md',
    danger: 'border border-notion-hairline bg-white hover:bg-red-50 hover:border-red-200 text-notion-ink hover:text-red-600 rounded-notion-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  };

  return (
    <button
      ref={ref}
      className={cn(baseClass, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';
