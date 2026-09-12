import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

// Notion design: feature-card / feature-card-elevated chrome
export const Card: React.FC<CardProps> = ({ children, className = '', elevated = false }) => {
  return (
    <div
      className={cn(
        'bg-notion-canvas rounded-notion-lg border border-notion-hairline p-8',
        elevated ? 'shadow-[var(--shadow-notion-elevated)]' : 'shadow-[var(--shadow-notion-soft)]',
        className
      )}
    >
      {children}
    </div>
  );
};
