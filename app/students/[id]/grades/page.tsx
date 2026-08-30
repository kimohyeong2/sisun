'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { getStudentGrades } from '@/actions/grades';
import { getStudentPercentile } from '@/actions/percentile';
import { saveTeacherComment } from '@/actions/comment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/Button';

export default function StudentGradesPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [percentileData, setPercentileData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const { id } = use(params);

  useEffect(() => {
    getStudentGrades(id).then((res) => {
      setData(res);
      setComment(res.studentComments || '');
      if (res.tests && res.tests.length > 0) {
        setSelectedTest(res.tests[res.tests.length - 1]);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (selectedTest?.id) {
        getStudentPercentile(selectedTest.id, id).then(setPercentileData);
    }
  }, [selectedTest, id]);

  const filteredTests = useMemo(() => {
    if (!data) return [];
    return subjectFilter === '전체' 
      ? data.tests 
      : data.tests.filter((t: any) => t.subject === subjectFilter);
  }, [data, subjectFilter]);

  const subjects = useMemo(() => Array.from(new Set(data?.tests.map((t: any) => t.subject))) as string[], [data]);

  useEffect(() => {
    if (subjects.length > 0 && !subjectFilter) {
      setSubjectFilter(subjects[0]);
    }
  }, [subjects, subjectFilter]);
  
  const handleSaveComment = async () => {
    await saveTeacherComment(id, comment);
    alert('코멘트가 저장되었습니다.');
  };

  if (loading) return <div>로딩 중...</div>;
  if (!data) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-notion-ink">{data.studentName}의 성적 리포트</h1>
        <Button onClick={() => window.print()} className="no-print">PDF 다운로드</Button>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[350px]">
          <div className="h-full bg-notion-canvas p-4 border border-notion-hairline rounded-lg shadow-sm flex flex-col">
            <div className="flex gap-2 mb-4 shrink-0 no-print">
                {subjects.map((sub, index) => (
                    <button 
                      key={`${sub}-${index}`} 
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                        subjectFilter === sub 
                          ? 'bg-notion-blue text-white' 
                          : 'bg-notion-canvas-soft text-notion-ink-muted hover:bg-notion-hairline'
                      }`}
                      onClick={() => setSubjectFilter(sub)}
                    >
                      {sub}
                    </button>
                ))}
            </div>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTests} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                    <XAxis dataKey="date" stroke="#a39e98" />
                    <YAxis domain={[0, 100]} stroke="#a39e98" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#0075de" 
                      strokeWidth={3} 
                      label={{ position: 'top', fill: '#0075de', fontSize: 12, fontWeight: 600 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Exam List */}
          <div className="h-full bg-notion-canvas border border-notion-hairline rounded-lg overflow-hidden shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold text-notion-ink p-6 border-b border-notion-hairline shrink-0">최근 응시 시험</h2>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[12px] tracking-wider border-b border-notion-hairline sticky top-0">
                  <tr><th className="p-4 text-left">시험명</th><th className="p-4 text-left">일자</th><th className="p-4 text-right">점수</th></tr>
                </thead>
                <tbody className="divide-y divide-notion-hairline">
                  {[...data.tests].reverse().map((t: any, index: number) => (
                    <tr key={`${t.id}-${index}`} className="cursor-pointer hover:bg-notion-canvas-soft transition-colors" onClick={() => { setSelectedTest(t); }}>
                      <td className="p-4 text-notion-ink">{t.title}</td>
                      <td className="p-4 text-notion-ink-secondary">{t.date}</td>
                      <td className="p-4 text-right font-medium text-notion-blue">{t.score} / {t.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/* Detail Analysis */}
      {selectedTest && (
        <div className="bg-notion-canvas p-8 rounded-lg shadow-sm border border-notion-hairline space-y-6">
            <h2 className="text-xl font-bold text-notion-ink">{selectedTest.title} 상세 분석</h2>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-notion-canvas-soft rounded-md text-notion-ink-secondary font-medium">
                        총점: {selectedTest.score ?? 0}점 
                        <span className="block text-sm text-notion-ink-muted">({selectedTest.score ?? 0}점 / {selectedTest.total ?? 0}점)</span>
                      </div>
                      {percentileData ? (
                        <div className="p-4 bg-notion-canvas-soft rounded-md text-notion-ink-secondary font-medium">
                          백분위: {percentileData.percentile}% 
                          <span className="block text-sm text-notion-ink-muted">(상위 {percentileData.rank}등)</span>
                        </div>
                      ) : (
                        <div className="p-4 bg-notion-canvas-soft rounded-md text-notion-ink-secondary font-medium">
                          백분위: 데이터 없음
                        </div>
                      )}
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {Array.isArray(selectedTest.categories) ? (
                          selectedTest.categories.map((c: any, index: number) => (
                            <tr key={`${c.name || 'cat'}-${index}`} className="border-b border-notion-hairline">
                              <td className="p-2 text-notion-ink">{c.name}</td>
                              <td className="p-2 text-right text-notion-ink-secondary">{c.points} / {c.totalPoints}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td className="p-2" colSpan={2}>카테고리 정보가 없습니다.</td></tr>
                        )}
                      </tbody>
                    </table>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Array.isArray(selectedTest.categories) ? selectedTest.categories : []}>
                            <XAxis dataKey="name" stroke="#a39e98" />
                            <Tooltip />
                            <Bar dataKey="points" fill="#0075de" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {/* Teacher Comment Section */}
      <div className="bg-notion-canvas p-8 rounded-lg shadow-sm border border-notion-hairline space-y-4">
          <h2 className="text-xl font-bold text-notion-ink">선생님 코멘트</h2>
          <textarea className="w-full p-4 border border-notion-hairline rounded-md min-h-[150px] focus:outline-none focus:ring-1 focus:ring-notion-blue" value={comment} onChange={e => setComment(e.target.value)} placeholder="학생에 대한 코멘트를 작성해 주세요..." />
          <Button onClick={handleSaveComment} className="no-print">저장</Button>
      </div>
    </div>
  );
}
