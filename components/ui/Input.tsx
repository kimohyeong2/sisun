import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-notion-xs border border-notion-hairline bg-white px-3 py-1 text-sm transition-all placeholder:text-notion-ink-faint focus:outline-none focus:ring-1 focus:ring-notion-blue/30 focus:border-notion-blue shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
