'use client';

import { Dialog } from './Dialog';
import { Button } from './Button';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-notion-ink-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="h-9 px-4 rounded-[8px] text-xs" onClick={onClose}>취소</Button>
        <Button 
          variant="outline" 
          className="h-9 px-4 rounded-[8px] text-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200" 
          onClick={() => { onConfirm(); onClose(); }}
        >
          삭제
        </Button>
      </div>
    </Dialog>
  );
}
