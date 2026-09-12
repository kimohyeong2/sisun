-- 커리큘럼 관리 기능에 필요한 테이블입니다.
-- Supabase 대시보드 > SQL Editor 에서 한 번만 실행하세요.

create table if not exists curriculum_tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null default '',
  color text not null default '#9c2425',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 이미 이전 버전으로 테이블을 만든 경우를 위한 안전한 추가 (이미 있으면 무시됩니다)
alter table curriculum_tracks add column if not exists subject text not null default '';

-- 트랙(학년)별 1~12월 고정 캘린더. 한 트랙당 월별로 최대 1행만 존재합니다.
create table if not exists curriculum_items (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references curriculum_tracks(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  assignment text not null default '',
  created_at timestamptz not null default now(),
  unique (track_id, month)
);

create index if not exists idx_curriculum_items_track_id on curriculum_items(track_id);

-- 이 앱은 Supabase Auth 대신 teachers 테이블 기반 커스텀 로그인을 쓰고,
-- 서버 액션에서 service_role 키로만 접근하므로(RLS 우회) 별도 RLS 정책은 두지 않습니다.
-- 다른 테이블(tests, students 등)과 동일한 방식입니다.
