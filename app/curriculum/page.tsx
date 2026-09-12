'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { CalendarRange, Printer } from 'lucide-react';
import { getCurriculumTracks } from '@/actions/curriculum';
import TrackDialog from './TrackDialog';
import TrackRow, { type CurriculumTrack } from './TrackRow';
import CurriculumPrint from './CurriculumPrint';

export default function CurriculumPage() {
  const [tracks, setTracks] = useState<CurriculumTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('전체');

  const fetchData = useCallback(async () => {
    const data = await getCurriculumTracks();
    setTracks(data as CurriculumTrack[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const subjects = useMemo(
    () => ['전체', ...Array.from(new Set(tracks.map((t) => t.subject).filter(Boolean)))],
    [tracks]
  );

  const filteredTracks = filterSubject === '전체' ? tracks : tracks.filter((t) => t.subject === filterSubject);

  // 인쇄는 가로(A4 landscape) + 여백 1cm로 출력합니다. 전역 @page 규칙(세로, 성적표용)을 건드리지 않도록
  // 인쇄 직전에만 임시 스타일을 추가하고, 인쇄가 끝나면 바로 제거합니다.
  const handlePrint = () => {
    const style = document.createElement('style');
    style.textContent = '@media print { @page { size: A4 landscape; margin: 1cm; } }';
    document.head.appendChild(style);

    const cleanup = () => {
      style.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
  };

  return (
    <div className="p-8 space-y-8 print:p-0 print:space-y-0">
      <div className="no-print space-y-8">
        <PageHeader
          icon={<CalendarRange className="h-6 w-6" />}
          eyebrow="Curriculum"
          title="커리큘럼"
          description="과목·학년별로 1월~12월 진도와 과목을 등록하세요. 5·10월은 중간고사, 7·11월은 기말고사 시기입니다."
          actions={
            <>
              {tracks.length > 0 && (
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> PDF 다운로드
                </Button>
              )}
              <TrackDialog onSaved={fetchData} defaultSubject={filterSubject !== '전체' ? filterSubject : undefined} />
            </>
          }
        />

        {!loading && tracks.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {subjects.map((subject) => (
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
        )}

        {loading ? (
          <div className="p-16 text-center text-sm text-notion-ink-muted">데이터 불러오는 중...</div>
        ) : tracks.length === 0 ? (
          <div className="bg-notion-canvas border border-notion-hairline rounded-notion-lg shadow-[var(--shadow-notion-soft)]">
            <EmptyState
              icon={<CalendarRange className="h-6 w-6" />}
              title="등록된 트랙이 없습니다"
              description="상단의 '트랙 추가' 버튼으로 수학 중1, 영어 중2처럼 과목·학년별 트랙을 먼저 만들어 보세요."
            />
          </div>
        ) : (
          <div className="space-y-10">
            {filteredTracks.map((track) => (
              <TrackRow key={track.id} track={track} onChanged={fetchData} />
            ))}
          </div>
        )}
      </div>

      <CurriculumPrint tracks={filteredTracks} subject={filterSubject} />
    </div>
  );
}
