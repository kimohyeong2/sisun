'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { gradeTest } from '@/actions/grade';
import { getQuestionsForTest } from '@/actions/question';

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
    const data = await getQuestionsForTest(testId);
    setQuestions(data);
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
    <Card>
      <form action={handleFormAction} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select name="student_id" required defaultValue="">
            <option value="">학생 선택</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select name="test_id" onChange={(e) => handleTestChange(e.target.value)} required defaultValue={selectedTestId}>
            <option value="">시험지 선택</option>
            {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
        </div>

        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-notion-ink">답안 입력</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {questions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <label className="text-xs text-notion-ink-muted block">{q.question_no}번</label>
                  <Input name={`answer_${q.question_no}`} required />
                </div>
              ))}
            </div>
            <Button type="submit">채점하기</Button>
          </div>
        )}
      </form>
    </Card>
  );
}
