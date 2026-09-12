'use client';

import { Dialog } from './Dialog';
import { Button } from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-notion-ink-secondary mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        <Button
          size="sm"
          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          variant="outline"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          삭제
        </Button>
      </div>
    </Dialog>
  );
}
