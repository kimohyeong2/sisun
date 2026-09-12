'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Search, User, Users, GraduationCap, School } from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import StudentForm from './StudentForm';
import { deleteStudent, getStudentsForCharts, getStudentsPage } from './actions';
import { CHART_COLORS, CHART_GRID, chartTooltipStyle, axisTickStyle } from '@/components/charts/chartTheme';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [allData, { data, count }] = await Promise.all([
      getStudentsForCharts(),
      getStudentsPage(currentPage, search),
    ]);

    setAllStudents(allData);
    setStudents(data);
    setTotalCount(count);
    setLoading(false);
  }, [currentPage, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Aggregated data for charts
  const statusData = useMemo(() => {
    let middle = 0;
    let high = 0;
    let inactive = 0;

    allStudents.forEach(s => {
      if (s.enrollment_status !== 'active') {
        inactive++;
        return;
      }

      const school = s.school || '';
      if (school.endsWith('중') || school.endsWith('중학교')) {
        middle++;
      } else if (school.endsWith('고') || school.endsWith('고등학교')) {
        high++;
      }
    });

    return [
      { name: '중학생', value: middle },
      { name: '고등학생', value: high },
      { name: '휴원', value: inactive },
    ];
  }, [allStudents]);

  const schoolData = useMemo(() => {
    const counts = allStudents.reduce((acc: any, student) => {
      if (student.enrollment_status === 'active') {
        acc[student.school] = (acc[student.school] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allStudents]);

  const activeCount = useMemo(() => allStudents.filter(s => s.enrollment_status === 'active').length, [allStudents]);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<GraduationCap className="h-6 w-6" />}
        eyebrow="Student Management"
        title="학생"
        description="재원생 현황을 확인하고 학생 정보를 관리하세요."
        actions={<StudentForm onAdd={fetchData} />}
      />

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="전체 학생" value={allStudents.length} icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label="재원 중" value={activeCount} icon={<User className="h-5 w-5" />} />
        <StatCard label="중학생" value={statusData[0]?.value ?? 0} icon={<School className="h-5 w-5" />} />
        <StatCard label="고등학생" value={statusData[1]?.value ?? 0} icon={<GraduationCap className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-[15px] font-semibold text-notion-ink mb-1">학생 현황</h2>
          <p className="text-xs text-notion-ink-muted mb-4">재원 상태 및 학교급별 분포</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fill: '#31302e', fontSize: 12, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h2 className="text-[15px] font-semibold text-notion-ink mb-1">학교별 재학생</h2>
          <p className="text-xs text-notion-ink-muted mb-4">재원 중인 학생의 소속 학교 분포</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={schoolData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTickStyle} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-ink-faint" />
          <Input
            placeholder="이름 검색..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-notion-canvas border border-notion-hairline rounded-notion-lg overflow-hidden shadow-[var(--shadow-notion-soft)]">
        {loading ? (
          <div className="p-16 text-center text-sm text-notion-ink-muted">데이터 불러오는 중...</div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="등록된 학생이 없습니다"
            description="상단의 '학생 추가' 버튼으로 첫 학생을 등록해 보세요."
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm text-left">
            <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[11px] tracking-wider border-b border-notion-hairline">
              <tr>
                <th className="px-6 py-3">이름</th>
                <th className="px-6 py-3">학번</th>
                <th className="px-6 py-3">학교 / 학년</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-hairline">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-notion-canvas-soft/60 transition-colors group">
                  <td className="px-6 py-3.5 font-medium text-notion-ink">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-notion-blue/10 flex items-center justify-center text-notion-blue text-xs font-semibold shrink-0">
                        {student.name?.slice(0, 1) ?? <User className="h-4 w-4" />}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-notion-ink-secondary">{student.student_no}</td>
                  <td className="px-6 py-3.5 text-notion-ink-secondary">{student.school} / {student.grade}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={student.enrollment_status === 'active' ? 'active' : 'inactive'}>
                      {student.enrollment_status === 'active' ? '재원 중' : '미등원/휴원'}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/students/${student.id}/grades`}>
                        <Button variant="outline" size="sm">성적</Button>
                      </Link>
                      <StudentForm onAdd={fetchData} initialData={student} />
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(student.id)}>
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            이전
          </Button>
          <span className="text-sm text-notion-ink-muted tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            다음
          </Button>
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await deleteStudent(deleteId);
          if (result.success) fetchData();
          else alert(result.error);
        }}
        title="학생 삭제"
        message="정말 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다."
      />
    </div>
  );
}
