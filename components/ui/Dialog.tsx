'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export function Dialog({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-notion-canvas rounded-lg shadow-sm w-full max-w-lg overflow-hidden border border-notion-hairline">
        <div className="flex items-center justify-between p-4 border-b border-notion-hairline">
          <h2 className="text-sm font-semibold text-notion-ink">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-notion-ink-faint hover:text-notion-ink hover:bg-notion-canvas-soft transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
