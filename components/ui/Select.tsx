import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-notion-xs border border-notion-hairline bg-white pl-3 pr-8 py-1 text-sm text-notion-ink transition-all focus:outline-none focus:ring-1 focus:ring-notion-blue/30 focus:border-notion-blue disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-ink-faint" />
      </div>
    );
  }
);
Select.displayName = 'Select';
