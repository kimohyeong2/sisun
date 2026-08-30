import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
    
    const variantClasses = {
      primary: "bg-notion-blue text-white hover:bg-notion-blue-active rounded-full px-5 py-2 shadow-sm",
      outline: "border border-notion-hairline bg-white hover:bg-notion-canvas-soft text-notion-ink rounded-notion-md px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
      ghost: "hover:bg-notion-canvas-soft text-notion-ink-secondary rounded-notion-md px-3 py-1.5"
    };
    
    return <button ref={ref} className={`${baseClass} ${variantClasses[variant]} ${className}`} {...props} />;
  }
);
Button.displayName = 'Button';
