'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { addTest, deleteTest, getTests } from '@/actions/test';
import { gradeAndSaveAnswers } from '@/actions/grading';
import { getStudentsBasic } from '@/app/students/actions';
import { GradingModal } from '@/components/GradingModal';
import Link from 'next/link';
import { Plus, FileText, ClipboardCheck } from 'lucide-react';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('전체');

  async function fetchData() {
    const tData = await getTests();
    setTests(tData);
    const sData = await getStudentsBasic();
    setStudents(sData);
  }

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="space-y-8">
      <PageHeader
        icon={<FileText className="h-6 w-6" />}
        eyebrow="Test Management"
        title="시험지 관리"
        description="시험지를 생성하고 문항·채점을 관리하세요."
        actions={
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4" /> 새 시험지 생성
          </Button>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {subjects.map(subject => (
          <Button
            key={subject}
            size="sm"
            variant={filterSubject === subject ? 'primary' : 'outline'}
            onClick={() => setFilterSubject(subject)}
            className="rounded-full"
          >
            {subject}
          </Button>
        ))}
      </div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="새 시험지 생성">
        <form action={async (formData) => {
            await addTest(formData);
            setIsOpen(false);
            const data = await getTests();
            setTests(data);
        }} className="space-y-4">
          <Input name="title" placeholder="시험지 제목" required />
          <Input name="subject" placeholder="과목" required />
          <div className="flex gap-2">
            <Input name="test_year" type="number" placeholder="연도 (YYYY)" required />
            <Input name="test_month" type="number" placeholder="월 (MM)" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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

      {filteredTests.length === 0 ? (
        <div className="bg-notion-canvas border border-notion-hairline rounded-notion-lg shadow-[var(--shadow-notion-soft)]">
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="등록된 시험지가 없습니다"
            description="상단의 '새 시험지 생성' 버튼으로 첫 시험지를 만들어 보세요."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-notion-canvas p-6 rounded-notion-lg border border-notion-hairline shadow-[var(--shadow-notion-soft)] hover:shadow-[var(--shadow-notion-elevated)] hover:border-notion-blue/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-notion-blue/10 rounded-notion-md">
                  <FileText className="w-5 h-5 text-notion-blue" />
                </div>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(test.id)}>삭제</Button>
              </div>
              <h3 className="font-semibold text-lg text-notion-ink truncate">{test.title}</h3>
              <p className="text-sm text-notion-ink-muted mt-1">{test.test_year}.{test.test_month} · {test.subject}</p>
              <div className="mt-6 flex gap-2">
                <Link href={`/tests/${test.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">문제 관리</Button>
                </Link>
                <Button
                  onClick={() => { setSelectedTest(test); setGradingModalOpen(true); }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" /> 빠른 채점
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
