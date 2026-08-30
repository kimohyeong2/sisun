import { createClient } from '@/utils/supabase/server';
import GradingForm from './GradingForm';

export default async function GradingPage() {
  const supabase = await createClient();

  // 학생과 시험지 목록 가져오기
  const { data: students } = await supabase.from('students').select('id, name');
  const { data: tests } = await supabase.from('tests').select('id, title');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">자동 채점</h1>
      <GradingForm students={students || []} tests={tests || []} />
    </div>
  );
}
