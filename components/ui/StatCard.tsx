import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'primary' | 'neutral';
}

export function StatCard({ label, value, hint, icon, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="bg-notion-canvas rounded-notion-lg border border-notion-hairline p-5 shadow-[var(--shadow-notion-soft)] flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-notion-ink-muted">{label}</p>
        <p className="text-2xl font-bold text-notion-ink mt-2 tracking-tight">{value}</p>
        {hint && <p className="text-xs text-notion-ink-muted mt-1.5">{hint}</p>}
      </div>
      {icon && (
        <div
          className={`h-10 w-10 shrink-0 rounded-notion-md flex items-center justify-center ${
            tone === 'primary' ? 'bg-notion-blue/10 text-notion-blue' : 'bg-notion-canvas-soft text-notion-ink-muted'
          }`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
