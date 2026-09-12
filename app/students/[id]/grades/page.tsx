'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { getStudentGrades } from '@/actions/grades';
import { getStudentPercentile } from '@/actions/percentile';
import { saveTeacherComment } from '@/actions/comment';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Printer, Trophy, TrendingUp, MessageSquare, FileBarChart } from 'lucide-react';
import { CHART_COLORS, CHART_GRID, chartTooltipStyle, axisTickStyle } from '@/components/charts/chartTheme';

// 인쇄 전용 성적 추이 라인차트. recharts는 화면에 숨겨진 상태(display:none)에서 크기를 측정하지 못해
// 인쇄 시 빈 차트로 나올 수 있어, 인쇄 영역은 크기 측정이 필요 없는 고정 크기의 순수 SVG로 그립니다.
function PrintTrendChart({ tests }: { tests: { date: string; score: number; total: number }[] }) {
  const width = 640;
  const height = 160;
  const padding = 24;
  if (tests.length === 0) return null;

  const points = tests.map((t, i) => {
    const percent = t.total > 0 ? (t.score / t.total) * 100 : 0;
    const x = tests.length === 1 ? width / 2 : padding + (i / (tests.length - 1)) * (width - padding * 2);
    const y = height - padding - (percent / 100) * (height - padding * 2);
    return { x, y, percent, date: t.date };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e6e6e6" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e6e6e6" />
      <path d={path} fill="none" stroke="#9c2425" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#9c2425" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={10} fill="#31302e">{Math.round(p.percent)}%</text>
          <text x={p.x} y={height - padding + 14} textAnchor="middle" fontSize={9} fill="#a39e98">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

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

  const overallPercent = selectedTest?.total > 0 ? Math.round((selectedTest.score / selectedTest.total) * 100) : 0;

  const weakCategories = useMemo(() => {
    if (!selectedTest?.categories) return [];
    return [...selectedTest.categories]
      .map((c: any) => ({ ...c, rate: c.totalPoints > 0 ? Math.round((c.points / c.totalPoints) * 100) : 0 }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);
  }, [selectedTest]);

  if (loading) return <div>로딩 중...</div>;
  if (!data) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="p-8 space-y-8 print:p-0 print:space-y-0">
      {/* 화면용 대시보드 (인쇄 시 숨김) */}
      <div className="no-print space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-notion-blue mb-1">Grade Report</p>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-notion-ink tracking-[-0.5px]">{data.studentName} 학생</h1>
        </div>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> PDF 다운로드</Button>
      </div>

      {data.tests.length === 0 ? (
        <div className="bg-notion-canvas border border-notion-hairline rounded-notion-lg shadow-[var(--shadow-notion-soft)]">
          <EmptyState
            icon={<FileBarChart className="h-6 w-6" />}
            title="응시한 시험이 없습니다"
            description="시험지 관리에서 채점을 완료하면 이 학생의 성적 리포트가 표시됩니다."
          />
        </div>
      ) : (
      <>
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="최근 응시 시험" value={data.tests.length} />
        <StatCard label="최근 점수" value={selectedTest ? `${selectedTest.score} / ${selectedTest.total}` : '-'} tone="primary" icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="정답률" value={`${overallPercent}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="백분위" value={percentileData ? `${percentileData.percentile}%` : '-'} hint={percentileData ? `상위 ${percentileData.rank}등` : undefined} />
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[360px]">
          <Card className="h-full !p-4 flex flex-col">
            <div className="flex gap-2 mb-4 shrink-0 no-print px-1">
                {subjects.map((sub, index) => (
                    <Button
                      key={`${sub}-${index}`}
                      size="sm"
                      variant={subjectFilter === sub ? 'primary' : 'outline'}
                      className="rounded-full"
                      onClick={() => setSubjectFilter(sub)}
                    >
                      {sub}
                    </Button>
                ))}
            </div>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTests} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                    <XAxis dataKey="date" tick={axisTickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axisTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip {...chartTooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={3}
                      fill="url(#scoreFill)"
                      dot={{ r: 4, fill: CHART_COLORS[0], strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </Card>

          {/* Exam List */}
          <div className="h-full bg-notion-canvas border border-notion-hairline rounded-notion-lg overflow-hidden shadow-[var(--shadow-notion-soft)] flex flex-col">
            <h2 className="text-[15px] font-semibold text-notion-ink px-6 py-4 border-b border-notion-hairline shrink-0">최근 응시 시험</h2>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[11px] tracking-wider border-b border-notion-hairline sticky top-0">
                  <tr><th className="p-4 text-left">시험명</th><th className="p-4 text-left">일자</th><th className="p-4 text-right">점수</th></tr>
                </thead>
                <tbody className="divide-y divide-notion-hairline">
                  {[...data.tests].reverse().map((t: any, index: number) => (
                    <tr
                      key={`${t.id}-${index}`}
                      className={`cursor-pointer transition-colors ${selectedTest?.id === t.id ? 'bg-notion-blue/5' : 'hover:bg-notion-canvas-soft'}`}
                      onClick={() => { setSelectedTest(t); }}
                    >
                      <td className="p-4 text-notion-ink font-medium">{t.title}</td>
                      <td className="p-4 text-notion-ink-secondary">{t.date}</td>
                      <td className="p-4 text-right font-semibold text-notion-blue tabular-nums">{t.score} / {t.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/* Detail Analysis */}
      {selectedTest && (
        <Card className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-notion-ink">{selectedTest.title}</h2>
              <p className="text-sm text-notion-ink-muted mt-0.5">상세 분석</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-notion-canvas-soft rounded-notion-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-notion-ink-muted">총점</p>
                        <p className="text-lg font-bold text-notion-ink mt-1">{selectedTest.score ?? 0}점</p>
                        <p className="text-xs text-notion-ink-muted mt-0.5">({selectedTest.score ?? 0}점 / {selectedTest.total ?? 0}점)</p>
                      </div>
                      <div className="p-4 bg-notion-canvas-soft rounded-notion-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-notion-ink-muted">백분위</p>
                        {percentileData ? (
                          <>
                            <p className="text-lg font-bold text-notion-blue mt-1">{percentileData.percentile}%</p>
                            <p className="text-xs text-notion-ink-muted mt-0.5">상위 {percentileData.rank}등</p>
                          </>
                        ) : (
                          <p className="text-sm text-notion-ink-muted mt-1">데이터 없음</p>
                        )}
                      </div>
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
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                            <XAxis dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Bar dataKey="points" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={48} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
      )}
      </>
      )}

      {/* Teacher Comment Section */}
      <Card className="space-y-4">
          <h2 className="text-xl font-bold text-notion-ink flex items-center gap-2"><MessageSquare className="h-5 w-5 text-notion-blue" /> 선생님 코멘트</h2>
          <Textarea className="min-h-[150px]" value={comment} onChange={e => setComment(e.target.value)} placeholder="학생에 대한 코멘트를 작성해 주세요..." />
          <Button onClick={handleSaveComment}>저장</Button>
      </Card>
      </div>

      {/* 인쇄/PDF 전용 리포트 (화면에는 숨김) */}
      <div className="print-only text-black text-[13px]">
        {/* 헤더 */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <h1 className="text-3xl font-bold tracking-tight">진단평가 보고서 SUMMARY</h1>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sisun.png" alt="시선 로고" width={40} height={40} className="object-contain" />
            <p className="text-base font-bold leading-tight">시선입시학원</p>
          </div>
        </div>

        {selectedTest && (
          <>
            {/* 학생/시험 요약 */}
            <div className="flex items-center justify-between mt-4 print-avoid-break">
              <div>
                <h2 className="text-xl font-bold">{data.studentName} 학생</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedTest.title} · {selectedTest.date} · 정답 {selectedTest.correctCount ?? '-'} / {selectedTest.questionCount ?? '-'}문항
                </p>
              </div>
              <div className="flex gap-2">
                <div className="text-center border border-gray-300 rounded-md px-4 py-1.5">
                  <p className="text-[10px] text-gray-500">종합평가결과</p>
                  <p className="text-lg font-bold text-notion-blue">{selectedTest.score}점</p>
                </div>
                <div className="text-center border border-gray-300 rounded-md px-4 py-1.5">
                  <p className="text-[10px] text-gray-500">예상 백분위</p>
                  <p className="text-lg font-bold text-notion-blue">
                    {percentileData ? `${percentileData.percentile}%` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* 1~4. 2단 구성 */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              {/* 1. 단원별 분석 */}
              <div className="print-avoid-break">
                <h2 className="text-xs font-bold border-l-4 border-notion-blue pl-2 mb-2">1. 단원별 분석</h2>
                <table className="w-full text-xs border-collapse mb-2">
                  <thead>
                    <tr className="border-b border-t border-black">
                      <th className="p-1.5 text-left font-semibold">단원</th>
                      <th className="p-1.5 text-right font-semibold">배점</th>
                      <th className="p-1.5 text-right font-semibold">득점</th>
                      <th className="p-1.5 text-right font-semibold">정답률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTest.categories ?? []).map((c: any, index: number) => (
                      <tr key={`${c.name || 'cat'}-${index}`} className="border-b border-gray-300">
                        <td className="p-1.5">{c.name}</td>
                        <td className="p-1.5 text-right">{c.totalPoints}</td>
                        <td className="p-1.5 text-right">{c.points}</td>
                        <td className="p-1.5 text-right">{c.totalPoints > 0 ? Math.round((c.points / c.totalPoints) * 100) : 0}%</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="p-1.5">합계</td>
                      <td className="p-1.5 text-right">{selectedTest.total}</td>
                      <td className="p-1.5 text-right">{selectedTest.score}</td>
                      <td className="p-1.5 text-right">{overallPercent}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. 난이도별 분석 */}
              <div className="print-avoid-break">
                <h2 className="text-xs font-bold border-l-4 border-notion-blue pl-2 mb-2">2. 난이도별 분석</h2>
                <table className="w-full text-xs border-collapse mb-2">
                  <thead>
                    <tr className="border-b border-t border-black">
                      <th className="p-1.5 text-left font-semibold">난이도</th>
                      <th className="p-1.5 text-right font-semibold">배점</th>
                      <th className="p-1.5 text-right font-semibold">득점</th>
                      <th className="p-1.5 text-right font-semibold">정답률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTest.difficulties ?? []).map((d: any, index: number) => (
                      <tr key={`${d.name || 'diff'}-${index}`} className="border-b border-gray-300">
                        <td className="p-1.5">{d.name}</td>
                        <td className="p-1.5 text-right">{d.totalPoints}</td>
                        <td className="p-1.5 text-right">{d.points}</td>
                        <td className="p-1.5 text-right">{d.totalPoints > 0 ? Math.round((d.points / d.totalPoints) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3. 성적 변화 추이 */}
              <div className="print-avoid-break">
                <h2 className="text-xs font-bold border-l-4 border-notion-blue pl-2 mb-2">3. 성적 변화 추이</h2>
                <p className="text-[11px] text-gray-500 mb-2">
                  시험명 {selectedTest.title} · 시험일 {selectedTest.date} · 총점 {selectedTest.score}점
                </p>
                <PrintTrendChart tests={data.tests} />
              </div>

              {/* 4. 학습 추천사항 */}
              <div className="print-avoid-break">
                <h2 className="text-xs font-bold border-l-4 border-notion-blue pl-2 mb-2">4. 학습 추천사항</h2>
                <div className="border border-gray-300 rounded-md p-3">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1">재학습 추천 단원</p>
                  {weakCategories.length > 0 ? (
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {weakCategories.map((c: any, index: number) => (
                        <li key={`${c.name}-${index}`}>
                          {c.name} (정답률 {c.rate}%) — 개념 복습과 유사 유형 반복 학습이 필요합니다.
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">취약 단원이 발견되지 않았습니다.</p>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  ※ 재학습 추천은 정답률 기반으로 자동 산출된 참고 지표이며, 학원의 공식 기준과 다를 수 있습니다.
                </p>
              </div>

              {/* 5. 선생님 코멘트 */}
              <div className="col-span-2 print-avoid-break">
                <h2 className="text-xs font-bold border-l-4 border-notion-blue pl-2 mb-2">5. 선생님 코멘트</h2>
                <div className="border border-gray-300 rounded-md p-3">
                  <p className="text-xs whitespace-pre-wrap">{comment || '작성된 코멘트가 없습니다.'}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 pt-3 border-t border-gray-300 text-[10px] text-gray-400">
          출력일 {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
