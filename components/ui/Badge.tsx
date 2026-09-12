import { cn } from '@/utils/cn';

type Variant = 'active' | 'inactive' | 'primary';

const styles: Record<Variant, string> = {
  active: 'bg-[#e7f3ef] text-[#1aae39]',
  inactive: 'bg-[#f1f1ef] text-[#615d59]',
  primary: 'bg-[#f5e9e9] text-notion-blue',
};

export function Badge({
  children,
  variant,
  className = '',
}: {
  children: React.ReactNode;
  variant: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
