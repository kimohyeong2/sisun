'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { gradeTest } from '@/actions/grade';
import { createClient } from '@/utils/supabase/client';

export default function GradingForm({ students, tests }: { students: any[]; tests: any[] }) {
  const [selectedTestId, setSelectedTestId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);

  // 시험지 선택 시 문항 정보 가져오기
  async function handleTestChange(testId: string) {
    setSelectedTestId(testId);
    if (!testId) {
      setQuestions([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from('questions').select('*').eq('test_id', testId).order('question_no');
    setQuestions(data || []);
  }

  async function handleFormAction(formData: FormData) {
    const result = await gradeTest(formData);
    if (result && 'error' in result) {
      alert(result.error);
    } else {
      alert('채점 완료');
    }
  }

  return (
    <form action={handleFormAction} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-2 gap-4">
        <select name="student_id" className="p-2 border rounded-md" required>
          <option value="">학생 선택</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="test_id" onChange={(e) => handleTestChange(e.target.value)} className="p-2 border rounded-md" required>
          <option value="">시험지 선택</option>
          {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">답안 입력</h3>
          <div className="grid grid-cols-5 gap-4">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="text-xs text-slate-500 block">{q.question_no}번</label>
                <input name={`answer_${q.question_no}`} className="w-full p-2 border rounded-md" required />
              </div>
            ))}
          </div>
          <Button type="submit">채점하기</Button>
        </div>
      )}
    </form>
  );
}
