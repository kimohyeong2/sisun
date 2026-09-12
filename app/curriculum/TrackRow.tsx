'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Textarea } from '@/components/ui/Textarea';
import { Trash2, Save, ArrowRight, Scissors } from 'lucide-react';
import { saveMonthlyAssignments, deleteTrack } from '@/actions/curriculum';
import TrackDialog from './TrackDialog';

export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
export const EXAM_LABELS: Record<number, string> = {
  5: '중간고사',
  7: '기말고사',
  10: '중간고사',
  11: '기말고사',
};

const CELL_WIDTH = 112; // w-28
const CELL_GAP = 8; // gap-2

export interface Span {
  start: number; // 0-based month index
  length: number;
  text: string;
}

// 인접한 달의 내용이 완전히 같으면 하나의 넓은 블록으로 합쳐서 보여줍니다.
// 빈 칸은 합치지 않고 항상 개별 입력칸으로 유지합니다.
export function buildSpans(assignments: string[]): Span[] {
  const spans: Span[] = [];
  let i = 0;
  while (i < MONTHS.length) {
    const text = assignments[i] || '';
    let length = 1;
    if (text) {
      while (i + length < MONTHS.length && (assignments[i + length] || '') === text) {
        length++;
      }
    }
    spans.push({ start: i, length, text });
    i += length;
  }
  return spans;
}

export interface CurriculumTrack {
  id: string;
  name: string;
  subject: string;
  color: string;
  sort_order: number;
  assignments: string[];
}

export default function TrackRow({
  track,
  onChanged,
}: {
  track: CurriculumTrack;
  onChanged: () => void;
}) {
  const [assignments, setAssignments] = useState<string[]>(track.assignments);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const spans = useMemo(() => buildSpans(assignments), [assignments]);

  const setMonths = (indices: number[], value: string) => {
    setAssignments((prev) => {
      const next = [...prev];
      indices.forEach((i) => { next[i] = value; });
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveMonthlyAssignments(track.id, assignments);
    setSaving(false);
    if (result.success) {
      setDirty(false);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {track.subject && (
            <span className="text-xs font-semibold text-notion-ink-muted uppercase tracking-wider">{track.subject}</span>
          )}
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white shrink-0"
            style={{ backgroundColor: track.color }}
          >
            {track.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? '저장 중...' : '저장'}
            </Button>
          )}
          <TrackDialog onSaved={onChanged} initialData={track} />
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-stretch gap-2 min-w-max pt-1">
          {spans.map((span) => {
            const monthIndices = Array.from({ length: span.length }, (_, k) => span.start + k);
            const monthLabels = monthIndices.map((i) => MONTHS[i]);
            const examLabels = Array.from(new Set(monthLabels.map((m) => EXAM_LABELS[m]).filter(Boolean)));
            const canExtend =
              span.text &&
              span.start + span.length < MONTHS.length &&
              !(assignments[span.start + span.length] || '');
            const width = span.length * CELL_WIDTH + (span.length - 1) * CELL_GAP;

            return (
              <div
                key={span.start}
                className="shrink-0 flex flex-col items-center gap-1.5"
                style={{ width }}
              >
                <div className="flex flex-col items-center gap-1 min-h-9 justify-end">
                  <span className="text-xs font-semibold text-notion-ink-muted whitespace-nowrap">
                    {span.length > 1 ? `${monthLabels[0]}월 - ${monthLabels[monthLabels.length - 1]}월` : `${monthLabels[0]}월`}
                  </span>
                  {examLabels.length > 0 && (
                    <div className="flex gap-1">
                      {examLabels.map((label) => (
                        <span
                          key={label}
                          className="text-[10px] font-semibold leading-none px-1.5 py-1 rounded-full bg-notion-blue/10 text-notion-blue whitespace-nowrap"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-full">
                  <Textarea
                    value={span.text}
                    onChange={(e) => setMonths(monthIndices, e.target.value)}
                    placeholder="과목/진도"
                    className="w-full h-24 text-xs text-center resize-none border-t-[3px] px-2 py-2"
                    style={{ borderTopColor: track.color }}
                  />
                  {span.length > 1 && (
                    <button
                      type="button"
                      title="마지막 달 분리"
                      onClick={() => setMonths([span.start + span.length - 1], '')}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-notion-hairline shadow-sm flex items-center justify-center text-notion-ink-muted hover:text-notion-ink hover:border-notion-ink-muted transition-colors"
                    >
                      <Scissors className="h-2.5 w-2.5" />
                    </button>
                  )}
                  {canExtend && (
                    <button
                      type="button"
                      title="다음 달까지 진도 연장"
                      onClick={() => setMonths([span.start + span.length], span.text)}
                      className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-notion-hairline shadow-sm flex items-center justify-center text-notion-ink-muted hover:text-notion-blue hover:border-notion-blue/40 transition-colors"
                    >
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteTrack(track.id);
          if (result.success) onChanged();
          else alert(result.error);
        }}
        title="트랙 삭제"
        message="이 트랙과 입력된 모든 월별 과제가 함께 삭제됩니다. 정말 삭제하시겠습니까?"
      />
    </div>
  );
}
