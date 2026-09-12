'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { getExistingAnswers } from '@/actions/grading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, Circle } from 'lucide-react';

const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3'];

export function GradingModal({
  isOpen,
  onClose,
  testId,
  testTitle,
  students,
  onGrade
}: {
  isOpen: boolean,
  onClose: () => void,
  testId: string,
  testTitle: string,
  students: any[],
  onGrade: (data: { student_id: string, answerString: string }[]) => void
}) {
  const [tab, setTab] = useState<'individual' | 'paste'>('individual');
  const [filterGrade, setFilterGrade] = useState('전체');
  const [search, setSearch] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pasteText, setPasteText] = useState('');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Fetch existing answers when modal opens
  useEffect(() => {
    if (isOpen) {
      getExistingAnswers(testId).then(setAnswers);
    }
  }, [isOpen, testId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      (filterGrade === '전체' || s.grade === filterGrade) &&
      (s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [students, filterGrade, search]);

  const completedCount = useMemo(
    () => students.filter(s => answers[s.id]).length,
    [students, answers]
  );

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextStudent = filteredStudents[index + 1];
      if (nextStudent) {
        inputRefs.current[nextStudent.id]?.focus();
      }
    }
  };

  const handleBulkPaste = () => {
    const lines = pasteText.split('\n');
    const newAnswers = { ...answers };
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return;
      const [name, ...ans] = parts;
      const student = students.find(s => s.name === name);
      if (student) newAnswers[student.id] = ans.join(' ');
    });
    setAnswers(newAnswers);
    setTab('individual');
    setPasteText('');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`${testTitle} · 일괄 채점`} size="lg">
      <div className="flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-notion-canvas z-20 pb-2">
          <div className="flex gap-2">
            <Button size="sm" variant={tab === 'individual' ? 'primary' : 'outline'} onClick={() => setTab('individual')}>개별 입력</Button>
            <Button size="sm" variant={tab === 'paste' ? 'primary' : 'outline'} onClick={() => setTab('paste')}>일괄 붙여넣기</Button>
          </div>
          <span className="text-xs font-medium text-notion-ink-muted tabular-nums">{completedCount} / {students.length}명 완료</span>
        </div>

        {tab === 'individual' ? (
          <>
            <div className="flex gap-2 mb-3 sticky top-[44px] bg-notion-canvas pt-1 pb-3 z-10 border-b border-notion-hairline">
              <Select onChange={(e) => setFilterGrade(e.target.value)} className="w-28 shrink-0">
                <option>전체</option>
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </Select>
              <Input placeholder="이름 검색" onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 min-h-[300px] space-y-1.5 pt-3">
              {filteredStudents.map((student, index) => {
                const done = !!answers[student.id];
                return (
                  <div key={student.id} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-[#1aae39] shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-notion-ink-faint shrink-0" />
                    )}
                    <span className="w-20 text-sm text-notion-ink truncate shrink-0">{student.name}</span>
                    <Input
                      ref={el => { if (el) inputRefs.current[student.id] = el; }}
                      placeholder="1 2 4 5"
                      value={answers[student.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [student.id]: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-[300px]">
            <Textarea
              className="h-64"
              placeholder={'홍길동 1 2 4 5\n김철수 1 2 3 5'}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button onClick={handleBulkPaste} className="mt-3 w-full">파싱 및 적용</Button>
          </div>
        )}

        <div className="sticky bottom-0 bg-notion-canvas pt-4 mt-4 border-t border-notion-hairline">
          <Button onClick={() => onGrade(Object.entries(answers).map(([student_id, answerString]) => ({ student_id, answerString })))} className="w-full">
            채점 및 저장
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
