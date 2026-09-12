import { createClient } from '@/utils/supabase/server';
import { requireTeacherId } from '@/utils/auth-guard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ClipboardCheck } from 'lucide-react';
import GradingForm from './GradingForm';

export default async function GradingPage() {
  await requireTeacherId();
  const supabase = await createClient();

  // 학생과 시험지 목록 가져오기
  const { data: students } = await supabase.from('students').select('id, name');
  const { data: tests } = await supabase.from('tests').select('id, title');

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<ClipboardCheck className="h-6 w-6" />}
        eyebrow="Grading"
        title="자동 채점"
        description="학생과 시험지를 선택해 개별 답안을 채점하세요."
      />
      <GradingForm students={students || []} tests={tests || []} />
    </div>
  );
}
