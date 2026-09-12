'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { upsertQuestions, getQuestionsForTest } from '@/actions/question';
import { updateTest, deleteTest, getTestDetailData } from '@/actions/test';
import { Trash2, Plus, Edit, Save, ArrowLeft, ListChecks, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';
import { CHART_COLORS, chartTooltipStyle, axisTickStyle } from '@/components/charts/chartTheme';

export default function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState(false);
  const [deleteQIndex, setDeleteQIndex] = useState<number | null>(null);
  const resolvedParams = use(params);
  const test_id = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { test: tData, questions: qData, accuracyStats: rates } = await getTestDetailData(test_id);
      if (tData) setTest(tData);
      setQuestions(qData);
      setAccuracyStats(rates);
      setIsLoading(false);
    }
    fetchData();
  }, [test_id]);

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
      const data = await getQuestionsForTest(test_id);
      setQuestions(data);
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0">
            <Link href="/tests" className="text-notion-ink-muted hover:text-notion-ink shrink-0"><ArrowLeft /></Link>
            <div className="min-w-0">
              <h1 className="text-[28px] sm:text-[32px] font-bold text-notion-ink tracking-[-0.5px] truncate">{test?.title}</h1>
              <p className="text-sm text-notion-ink-muted mt-0.5">{test?.test_year}.{test?.test_month} · {test?.subject}</p>
            </div>
        </div>
        <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit className="w-3.5 h-3.5" /> 수정</Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteTestId(true)}><Trash2 className="w-3.5 h-3.5" />삭제</Button>
            <Button onClick={handleAddRow} variant="outline" size="sm"><Plus className="w-3.5 h-3.5" /> 행 추가</Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm"><Save className="w-3.5 h-3.5" />{isSaving ? '저장 중...' : '문항 저장'}</Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 문항" value={`${stats.totalQuestions}문제`} icon={<ListChecks className="h-5 w-5" />} tone="primary" />
        <StatCard label="총 배점" value={`${stats.totalPoints}점`} icon={<Target className="h-5 w-5" />} />
        <StatCard label="분류 수" value={stats.categoryData.length} />
        <StatCard label="난이도 구분" value={stats.difficultyData.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <h3 className="text-[15px] font-semibold text-notion-ink mb-4">분류별 배점</h3>
            {questions.length > 0 ? (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 8, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={axisTickStyle} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Bar dataKey="points" fill={CHART_COLORS[0]} barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12, fill: '#31302e' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : <p className="text-sm text-notion-ink-faint">데이터가 없습니다.</p>}
        </Card>
        <Card>
            <h3 className="text-[15px] font-semibold text-notion-ink mb-4">난이도별 문항 수</h3>
            {questions.length > 0 ? (
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.difficultyData} dataKey="value" nameKey="name" outerRadius={65} paddingAngle={2} label={({ name, value }) => `${name} ${value}`} labelLine={false}>
                                {stats.difficultyData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />)}
                            </Pie>
                            <Tooltip {...chartTooltipStyle} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : <p className="text-sm text-notion-ink-faint">문항을 추가하면 통계가 표시됩니다.</p>}
        </Card>
      </div>

      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="시험지 정보 수정">
        <form action={async (formData) => {
            const result = await updateTest(test_id, formData);
            if (result.success) {
                setIsEditOpen(false);
                const { test: data } = await getTestDetailData(test_id);
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>취소</Button>
            <Button type="submit">수정</Button>
          </div>
        </form>
      </Dialog>

      <div className="bg-notion-canvas rounded-notion-lg border border-notion-hairline overflow-hidden shadow-[var(--shadow-notion-soft)]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[11px] tracking-wider border-b border-notion-hairline">
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
              <tr key={q.id} className="hover:bg-notion-canvas-soft/40 transition-colors">
                <td className="px-4 py-2 w-15 font-medium text-notion-ink">{index + 1}</td>
                <td className="px-4 py-2"><Input type="number" value={q.points} onChange={(e) => handleChange(index, 'points', parseInt(e.target.value))} className="w-16" /></td>
                <td className="px-4 py-2"><Input value={q.correct_answer} onChange={(e) => handleChange(index, 'correct_answer', e.target.value)} className="w-20" /></td>
                <td className="px-4 py-2"><Input value={q.category} onChange={(e) => handleChange(index, 'category', e.target.value)} className="w-32" /></td>
                <td className="px-4 py-2"><Input value={q.difficulty} onChange={(e) => handleChange(index, 'difficulty', e.target.value)} className="w-24" /></td>
                <td className="px-4 py-2 text-notion-ink-secondary tabular-nums">{accuracyStats[q.question_no] ?? 0}%</td>
                <td className="px-4 py-2 text-center"><Button variant="danger" size="sm" onClick={() => setDeleteQIndex(index)}>삭제</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
