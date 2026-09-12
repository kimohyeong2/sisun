import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="h-12 w-12 rounded-full bg-notion-canvas-soft flex items-center justify-center text-notion-ink-faint mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-notion-ink-secondary">{title}</p>
      {description && <p className="text-xs text-notion-ink-faint mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
