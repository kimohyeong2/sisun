import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex w-full rounded-notion-xs border border-notion-hairline bg-white px-3 py-2 text-sm transition-all placeholder:text-notion-ink-faint focus:outline-none focus:ring-1 focus:ring-notion-blue/30 focus:border-notion-blue shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
