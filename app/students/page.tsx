'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Search, User } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StudentForm from './StudentForm';
import { deleteStudent } from './actions';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch all for charts
    const { data: allData } = await supabase.from('students').select('*');
    if (allData) setAllStudents(allData);

    // Fetch paginated
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, count } = await query;
    
    if (data) setStudents(data);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  }, [supabase, currentPage, search]);

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

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-notion-ink tracking-tight">🎓 학생 관리</h1>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-notion-hairline shadow-sm">
          <h2 className="text-lg font-semibold mb-4">학생 현황</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg border border-notion-hairline shadow-sm">
          <h2 className="text-lg font-semibold mb-4">학교별 재학생</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-notion-ink-faint" />
            <Input 
              placeholder="이름 검색..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }} 
              className="pl-8 rounded-[4px] border-notion-hairline focus:ring-1 focus:ring-notion-blue" 
            />
          </div>
          <StudentForm onAdd={fetchData} />
      </div>

      <div className="bg-notion-canvas border border-notion-hairline rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-notion-ink-muted">데이터 불러오는 중...</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-notion-ink-muted">등록된 학생이 없습니다.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-notion-canvas-soft text-notion-ink-muted uppercase font-semibold text-[12px] tracking-wider border-b border-notion-hairline">
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
                <tr key={student.id} className="hover:bg-notion-canvas-soft/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-notion-ink flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-notion-canvas-soft flex items-center justify-center text-notion-ink-muted">
                        <User className="h-4 w-4" />
                    </div>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-notion-ink-secondary">{student.student_no}</td>
                  <td className="px-6 py-4 text-notion-ink-secondary">{student.school} / {student.grade}</td>
                  <td className="px-6 py-4">
                    <Badge variant={student.enrollment_status === 'active' ? 'active' : 'inactive'}>
                      {student.enrollment_status === 'active' ? '🟢 재원 중' : '⚪ 미등원/휴원'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link href={`/students/${student.id}/grades`}>
                      <Button variant="outline" className="h-9 px-3 rounded-[8px] hover:bg-notion-canvas-soft border-notion-hairline text-xs font-medium text-notion-ink">성적</Button>
                    </Link>
                    <StudentForm onAdd={fetchData} initialData={student} />
                    <Button 
                      variant="outline" 
                      className="h-9 px-3 rounded-[8px] hover:bg-red-50 border-notion-hairline text-xs font-medium text-notion-ink hover:text-red-500" 
                      onClick={() => setDeleteId(student.id)}
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button 
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            이전
          </Button>
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
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
