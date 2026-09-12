import React from 'react';

interface PageHeaderProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ icon, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4 min-w-0">
        {icon && (
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-notion-lg bg-notion-blue/10 text-notion-blue">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[12px] font-semibold uppercase tracking-wider text-notion-blue mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[28px] sm:text-[32px] font-bold text-notion-ink tracking-[-0.5px] truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-notion-ink-muted mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
