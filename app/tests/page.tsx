'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { addTest, deleteTest } from '@/actions/test';
import { gradeAndSaveAnswers } from '@/actions/grading';
import { GradingModal } from '@/components/GradingModal';
import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('전체');
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: tData } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
      if (tData) setTests(tData);
      const { data: sData } = await supabase.from('students').select('id, name, grade');
      if (sData) setStudents(sData);
    }
    fetchData();
  }, [supabase]);

  const subjects = ['전체', ...Array.from(new Set(tests.map(t => t.subject)))];
  const filteredTests = filterSubject === '전체' ? tests : tests.filter(t => t.subject === filterSubject);

  async function handleGrade(gradingData: { student_id: string, answerString: string }[]) {
    if (!selectedTest) return;
    
    const result = await gradeAndSaveAnswers(selectedTest.id, gradingData);
    if (result.success) {
      alert('채점이 완료되었습니다.');
      setGradingModalOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-notion-ink tracking-tight">📝 시험지 관리</h1>
        <Button onClick={() => setIsOpen(true)} className="rounded-[8px] h-9 px-4">새 시험지 생성</Button>
      </div>

      <div className="flex gap-2">
        {subjects.map(subject => (
          <Button 
            key={subject} 
            variant={filterSubject === subject ? 'default' : 'outline'} 
            onClick={() => setFilterSubject(subject)}
            className="rounded-full px-4 py-1.5 h-auto text-xs"
          >
            {subject}
          </Button>
        ))}
      </div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="새 시험지 생성">
        <form action={async (formData) => {
            await addTest(formData);
            setIsOpen(false);
            const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
            if (data) setTests(data);
        }} className="space-y-4">
          <Input name="title" placeholder="시험지 제목" required />
          <Input name="subject" placeholder="과목" required />
          <div className="flex gap-2">
            <Input name="test_year" type="number" placeholder="연도 (YYYY)" required />
            <Input name="test_month" type="number" placeholder="월 (MM)" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>취소</Button>
            <Button type="submit">생성</Button>
          </div>
        </form>
      </Dialog>

      {gradingModalOpen && selectedTest && (
        <GradingModal 
          isOpen={gradingModalOpen}
          onClose={() => setGradingModalOpen(false)}
          testId={selectedTest.id}
          testTitle={selectedTest.title}
          students={students}
          onGrade={handleGrade}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests?.map((test) => (
          <div key={test.id} className="bg-notion-canvas p-6 rounded-lg border border-notion-hairline shadow-sm hover:border-notion-blue transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-notion-canvas-soft rounded-md">
                <FileText className="w-5 h-5 text-notion-blue" />
              </div>
              <Button variant="outline" className="h-9 px-3 rounded-[8px] hover:bg-red-50 border-notion-hairline text-xs font-medium text-notion-ink hover:text-red-500" onClick={() => setDeleteId(test.id)}>삭제</Button>
            </div>
            <h3 className="font-semibold text-lg text-notion-ink">{test.title}</h3>
            <p className="text-sm text-notion-ink-muted mt-1">{test.test_year}.{test.test_month} ({test.subject})</p>
            <div className="mt-6 flex gap-2">
              <Link href={`/tests/${test.id}`}><Button variant="outline" className="rounded-[8px] h-9 px-3 text-xs">문제 관리</Button></Link>
              <Button onClick={() => { setSelectedTest(test); setGradingModalOpen(true); }} variant="outline" className="rounded-[8px] h-9 px-3 text-xs">빠른 채점</Button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await deleteTest(deleteId);
          if (result.success) setTests(tests.filter(t => t.id !== deleteId));
          else alert(result.error);
        }}
        title="시험지 삭제"
        message="정말 삭제하시겠습니까? 관련된 문항과 학생 답안도 모두 삭제됩니다."
      />
    </div>
  );
}
