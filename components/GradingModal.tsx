'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';

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
  const supabase = createClient();

  // Fetch existing answers when modal opens
  useEffect(() => {
    if (isOpen) {
      async function fetchExistingAnswers() {
        const { data: questions } = await supabase
          .from('questions')
          .select('id, question_no')
          .eq('test_id', testId)
          .order('question_no');

        if (!questions || questions.length === 0) return;

        const { data: answersData } = await supabase
          .from('student_answers')
          .select('student_id, question_id, student_answer')
          .in('question_id', questions.map(q => q.id));

        if (answersData) {
          const newAnswers: Record<string, string[]> = {};
          answersData.forEach(ans => {
            const q = questions.find(q => q.id === ans.question_id);
            if (!q) return;
            if (!newAnswers[ans.student_id]) newAnswers[ans.student_id] = [];
            newAnswers[ans.student_id][q.question_no - 1] = ans.student_answer || '';
          });

          const formattedAnswers: Record<string, string> = {};
          Object.entries(newAnswers).forEach(([sid, ansArr]) => {
            formattedAnswers[sid] = ansArr.join(' ');
          });
          setAnswers(formattedAnswers);
        }
      }
      fetchExistingAnswers();
    }
  }, [isOpen, testId, students, supabase]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (filterGrade === '전체' || s.grade === filterGrade) &&
      (s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [students, filterGrade, search]);

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
    <Dialog isOpen={isOpen} onClose={onClose} title={`${testTitle} - 일괄 채점`}>
      <div className="flex flex-col max-h-[85vh]">
        <div className="flex gap-2 mb-4 sticky top-0 bg-white z-20 pb-2">
          <Button variant={tab === 'individual' ? 'primary' : 'outline'} onClick={() => setTab('individual')}>개별 입력</Button>
          <Button variant={tab === 'paste' ? 'primary' : 'outline'} onClick={() => setTab('paste')}>일괄 붙여넣기</Button>
        </div>

        {tab === 'individual' ? (
          <>
            <div className="flex gap-2 mb-4 sticky top-[50px] bg-white pt-2 pb-2 z-10 border-b border-slate-100">
              <select onChange={(e) => setFilterGrade(e.target.value)} className="rounded-lg border border-slate-300 p-2 text-sm">
                <option>전체</option>
                {['중1', '중2', '중3', '고1', '고2', '고3'].map(g => <option key={g}>{g}</option>)}
              </select>
              <Input placeholder="이름 검색" onChange={(e) => setSearch(e.target.value)} />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
              {filteredStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded w-12 text-center ${answers[student.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {answers[student.id] ? '완료' : '대기'}
                  </span>
                  <span className="w-20 text-sm truncate">{student.name}</span>
                  <Input 
                    ref={el => inputRefs.current[student.id] = el}
                    placeholder="1 2 4 5" 
                    value={answers[student.id] || ''}
                    onChange={(e) => setAnswers({...answers, [student.id]: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-[300px]">
            <textarea 
              className="w-full h-64 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="홍길동 1 2 4 5&#10;김철수 1 2 3 5"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button onClick={handleBulkPaste} className="mt-2 w-full">파싱 및 적용</Button>
          </div>
        )}

        <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t border-slate-200">
          <Button onClick={() => onGrade(Object.entries(answers).map(([student_id, answerString]) => ({ student_id, answerString })))} className="w-full">
            채점 및 저장
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
