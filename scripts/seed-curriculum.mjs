import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TRACKS = [
  {
    name: '예비중1',
    subject: '수학',
    color: '#2a6f97',
    assignments: ['', '', '', '', '', '', '', '', '중등수학 1-1', '중등수학 1-1', '', ''],
  },
  {
    name: '중1',
    subject: '수학',
    color: '#9c2425',
    assignments: [
      '중등수학 1-2', '', '중등수학 2-1', '',
      'Observe 중1-1\n중등수학 2-2', 'Observe 중1-1\n중등수학 2-2',
      'Observe 중1-2\n중등수학 3-1', '', '',
      'Observe 중1-2\n중등수학 3-1', '', '',
    ],
  },
  {
    name: '중2',
    subject: '수학',
    color: '#2f7d32',
    assignments: [
      '중등수학 3-1', '', '중등수학 3-2', '',
      'Observe 중2-1\n공통수학1', '',
      'Observe 중2-1\n공통수학1', '', '',
      'Observe 중2-2\n공통수학1', '', '',
    ],
  },
  {
    name: '중3',
    subject: '수학',
    color: '#4a3a7a',
    assignments: [
      '공통수학2', '', '공통수학2', '',
      'Observe 중3-1\n대수', '',
      'Observe 중3-1\n대수', '', '',
      'Observe 중3-2\n대수', '', '미적분1',
    ],
  },
];

async function seed() {
  console.log('Seeding curriculum mock data...');

  const { data: existing, error: existingError } = await supabase.from('curriculum_tracks').select('id');
  if (existingError) {
    console.error('curriculum_tracks 테이블을 찾을 수 없습니다. scripts/sql/curriculum.sql을 먼저 Supabase에서 실행해 주세요.');
    console.error(existingError);
    return;
  }

  if (existing && existing.length > 0) {
    console.log(`기존 트랙 ${existing.length}개를 삭제하고 새로 시드합니다 (관련 월별 데이터도 함께 삭제됩니다).`);
    const { error: delError } = await supabase.from('curriculum_tracks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) {
      console.error('기존 데이터 삭제 실패:', delError);
      return;
    }
  }

  for (let i = 0; i < TRACKS.length; i++) {
    const { name, subject, color, assignments } = TRACKS[i];

    const { data: track, error: trackError } = await supabase
      .from('curriculum_tracks')
      .insert({ name, subject, color, sort_order: i })
      .select()
      .single();

    if (trackError || !track) {
      console.error(`트랙 "${name}" 생성 실패:`, trackError);
      continue;
    }

    const items = assignments
      .map((assignment, index) => ({ track_id: track.id, month: index + 1, assignment }))
      .filter((item) => item.assignment);

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('curriculum_items').insert(items);
      if (itemsError) console.error(`"${name}" 월별 데이터 삽입 실패:`, itemsError);
    }

    console.log(`- ${subject} ${name} 생성 완료 (${items.length}개월 입력)`);
  }

  console.log('커리큘럼 mock data 시딩 완료.');
}

seed();
