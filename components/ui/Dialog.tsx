'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[3px] p-4 animate-overlay-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-notion-canvas rounded-notion-xl w-full overflow-hidden border border-notion-hairline shadow-[var(--shadow-notion-elevated)] animate-dialog-in',
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-notion-hairline">
          <h2 className="text-[15px] font-semibold text-notion-ink tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-notion-md text-notion-ink-faint hover:text-notion-ink hover:bg-notion-canvas-soft transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
