'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Plus } from 'lucide-react';
import { addTrack, updateTrack } from '@/actions/curriculum';
import { cn } from '@/utils/cn';

export const TRACK_COLORS = [
  { label: '레드', value: '#9c2425' },
  { label: '블루', value: '#2a6f97' },
  { label: '틸', value: '#1f7a6c' },
  { label: '오렌지', value: '#c2540c' },
  { label: '퍼플', value: '#4a3a7a' },
  { label: '그린', value: '#2f7d32' },
];

export default function TrackDialog({
  onSaved,
  initialData,
  defaultSubject,
}: {
  onSaved: () => void;
  initialData?: { id: string; name: string; subject: string; color: string };
  defaultSubject?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(initialData?.color || TRACK_COLORS[0].value);

  async function handleSubmit(formData: FormData) {
    formData.set('color', color);
    const result = initialData
      ? await updateTrack(initialData.id, formData)
      : await addTrack(formData);

    if (result.success) {
      setIsOpen(false);
      onSaved();
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      {initialData ? (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          수정
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4" /> 트랙 추가
        </Button>
      )}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={initialData ? '트랙 수정' : '새 트랙 추가'}
        size="sm"
      >
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-notion-ink">과목</label>
            <Input
              name="subject"
              defaultValue={initialData?.subject ?? defaultSubject}
              placeholder="예: 수학, 영어, 과학"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-notion-ink">트랙 이름</label>
            <Input name="name" defaultValue={initialData?.name} placeholder="예: 중1, 예비고1" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-notion-ink">색상</label>
            <div className="flex gap-2 flex-wrap">
              {TRACK_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'h-8 w-8 rounded-full ring-offset-2 transition-all',
                    color === c.value ? 'ring-2 ring-notion-ink' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button type="submit">{initialData ? '수정' : '추가'}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
