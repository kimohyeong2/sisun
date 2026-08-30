'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { upsertQuestions } from '@/actions/question';
import { updateTest, deleteTest } from '@/actions/test';
import { Trash2, Plus, Edit, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

export default function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState(false);
  const [deleteQIndex, setDeleteQIndex] = useState<number | null>(null);
  const supabase = createClient();
  const resolvedParams = use(params);
  const test_id = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: tData } = await supabase.from('tests').select('*').eq('id', test_id).single();
      if (tData) setTest(tData);
      const { data: qData } = await supabase.from('questions').select('*').eq('test_id', test_id).order('question_no');
      if (qData) setQuestions(qData);
      
      const { data: aData } = await supabase
        .from('student_answers')
        .select(`is_correct, questions!inner(question_no)`)
        .eq('questions.test_id', test_id);

      if (aData) {
        const stats = aData.reduce((acc: any, curr: any) => {
          const qNo = curr.questions.question_no;
          if (!acc[qNo]) acc[qNo] = { total: 0, correct: 0 };
          acc[qNo].total += 1;
          if (curr.is_correct) acc[qNo].correct += 1;
          return acc;
        }, {});
        
        const rates = Object.keys(stats).reduce((acc: any, qNo: any) => {
          acc[qNo] = Math.round((stats[qNo].correct / stats[qNo].total) * 100);
          return acc;
        }, {});
        setAccuracyStats(rates);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [supabase, test_id]);

  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    
    const categoryStats = questions.reduce((acc, q) => {
      const cat = q.category || '기타';
      if (!acc[cat]) acc[cat] = { name: cat, count: 0, points: 0 };
      acc[cat].count += 1;
      acc[cat].points += (Number(q.points) || 0);
      return acc;
    }, {} as Record<string, { name: string, count: number, points: number }>);
    
    const difficultyStats = questions.reduce((acc, q) => {
      const diff = q.difficulty || '미지정';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalQuestions, totalPoints, categoryData: Object.values(categoryStats), difficultyData: Object.entries(difficultyStats).map(([name, value]) => ({ name, value })) };
  }, [questions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleAddRow = () => {
    setQuestions([...questions, { id: `new-${Date.now()}`, question_no: questions.length + 1, points: 5, correct_answer: '', category: '', difficulty: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await upsertQuestions(test_id, questions);
    setIsSaving(false);
    if (result.success) {
      alert('저장되었습니다.');
      const { data } = await supabase.from('questions').select('*').eq('test_id', test_id).order('question_no');
      if (data) setQuestions(data);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteTest = async () => {
    const result = await deleteTest(test_id);
    if (result.success) {
        router.push('/tests');
    } else {
        alert(result.error);
    }
  };

  if (isLoading) return <div className="p-8 text-notion-ink-muted">로딩 중...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/tests" className="text-notion-ink-muted hover:text-notion-ink"><ArrowLeft /></Link>
            <h1 className="text-4xl font-bold text-notion-ink tracking-tight">{test?.title}</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)} className="rounded-[8px] h-9 px-3 text-xs"><Edit className="w-4 h-4 mr-2" /> 수정</Button>
            <Button variant="outline" onClick={() => setDeleteTestId(true)} className="rounded-[8px] h-9 px-3 text-xs"><Trash2 className="w-4 h-4 mr-2 text-red-500" />삭제</Button>
            <Button onClick={handleAddRow} variant="outline" className="rounded-[8px] h-9 px-3 text-xs"><Plus className="w-4 h-4 mr-2" /> 행 추가</Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-[8px] h-9 px-4 text-xs bg-notion-blue text-white hover:bg-notion-blue-active"><Save className="w-4 h-4 mr-2" />{isSaving ? '저장 중...' : '문항 저장'}</Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-notion-canvas p-6 rounded-lg border border-notion-hairline shadow-sm">
            <h3 className="text-xs font-semibold text-notion-ink-muted uppercase tracking-wider">총 현황</h3>
            <div className="mt-4">
                <p className="text-3xl font-bold text-notion-ink">{stats.totalQuestions} 문제</p>
                <p className="text-notion-ink-secondary mt-1">총 배점: {stats.totalPoints}점</p>
            </div>
        </div>
        <div className="bg-notion-canvas p-6 rounded-lg border border-notion-hairline shadow-sm">
            <h3 className="text-xs font-semibold text-notion-ink-muted uppercase tracking-wider mb-4">분류별 배점</h3>
            {questions.length > 0 ? (
                <div className="h-40 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 20, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#615d59'}} />
                            <Tooltip />
                            <Bar dataKey="points" fill="#0075de" barSize={20} label={{ position: 'right', fontSize: 12 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : <p className="text-sm text-notion-ink-faint mt-4">데이터가 없습니다.</p>}
        </div>
        <div className="bg-notion-canvas p-6 rounded-lg border border-notion-hairline shadow-sm">
            <h3 className="text-xs font-semibold text-notion-ink-muted uppercase tracking-wider mb-4">난이도별 문항 수</h3>
            {questions.length > 0 ? (
                <div className="h-48 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.difficultyData} dataKey="value" nameKey="name" outerRadius={60} label={({ name, value }) => `${name}: ${value}문제`} labelLine={true}>
                                {stats.difficultyData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : <p className="text-sm text-notion-ink-faint mt-4">문항을 추가하면 통계가 표시됩니다.</p>}
        </div>
      </div>

      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="시험지 정보 수정">
        <form action={async (formData) => {
            const result = await updateTest(test_id, formData);
            if (result.success) {
                setIsEditOpen(false);
                const { data } = await supabase.from('tests').select('*').eq('id', test_id).single();
                if (data) setTest(data);
            } else {
                alert(result.error);
            }
        }} className="space-y-4">
          <Input name="title" defaultValue={test?.title} placeholder="시험지 제목" required />
          <Input name="subject" defaultValue={test?.subject} placeholder="과목" required />
          <div className="flex gap-2">
            <Input name="test_year" type="number" defaultValue={test?.test_year} placeholder="연도 (YYYY)" required />
            <Input name="test_month" type="number" defaultValue={test?.test_month} placeholder="월 (MM)" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>취소</Button>
            <Button type="submit">수정</Button>
          </div>
        </form>
      </Dialog>

      <div className="bg-notion-canvas rounded-lg border border-notion-hairline overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[12px] tracking-wider border-b border-notion-hairline">
            <tr>
              <th className="px-4 py-3 w-15 text-left">번호</th>
              <th className="px-4 py-3 text-left">배점</th>
              <th className="px-4 py-3 text-left">정답</th>
              <th className="px-4 py-3 text-left">분류</th>
              <th className="px-4 py-3 text-left">난이도</th>
              <th className="px-4 py-3 w-30 text-left">정답률</th>
              <th className="px-4 py-3 w-30 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-notion-hairline">
            {questions.map((q, index) => (
              <tr key={q.id}>
                <td className="px-4 py-2 w-15 font-medium text-notion-ink">{index + 1}</td>
                <td className="px-4 py-2"><Input type="number" value={q.points} onChange={(e) => handleChange(index, 'points', parseInt(e.target.value))} className="w-16 rounded-[4px] border-notion-hairline" /></td>
                <td className="px-4 py-2"><Input value={q.correct_answer} onChange={(e) => handleChange(index, 'correct_answer', e.target.value)} className="w-20 rounded-[4px] border-notion-hairline" /></td>
                <td className="px-4 py-2"><Input value={q.category} onChange={(e) => handleChange(index, 'category', e.target.value)} className="w-32 rounded-[4px] border-notion-hairline" /></td>
                <td className="px-4 py-2"><Input value={q.difficulty} onChange={(e) => handleChange(index, 'difficulty', e.target.value)} className="w-24 rounded-[4px] border-notion-hairline" /></td>
                
                <td className="px-4 py-2 text-notion-ink-secondary">{accuracyStats[q.question_no] ?? 0}%</td>
                <td className="px-4 py-2 text-center"><Button variant="outline" onClick={() => setDeleteQIndex(index)} className="h-9 px-3 rounded-[8px] hover:bg-red-50 border-notion-hairline text-xs font-medium text-notion-ink hover:text-red-500">삭제</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog 
        isOpen={deleteTestId} 
        onClose={() => setDeleteTestId(false)}
        onConfirm={handleDeleteTest}
        title="시험지 삭제"
        message="정말 삭제하시겠습니까? 관련된 문항과 학생 답안도 모두 삭제됩니다."
      />
      <ConfirmDialog 
        isOpen={deleteQIndex !== null} 
        onClose={() => setDeleteQIndex(null)}
        onConfirm={() => deleteQIndex !== null && handleRemoveRow(deleteQIndex)}
        title="문항 삭제"
        message="정말 삭제하시겠습니까?"
      />
    </div>
  );
}
