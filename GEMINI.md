# 시선(Sisun) 학생 성적 관리 시스템

학원 선생님을 위한 Supabase 기반 Next.js 성적 관리 플랫폼입니다.

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Icons**: Lucide React
- **Visualization**: Recharts

## 프로젝트 구조
- `app/`: Next.js App Router 페이지 및 레이아웃
  - `students/`: 학생 관리 (등록, 목록)
  - `tests/`: 시험지 관리 및 문항 관리
  - `grading/`: 자동 채점 및 결과 저장
- `components/`: UI 컴포넌트
  - `ui/`: shadcn/ui 스타일 재구현 (Button, Input, Dialog)
  - `Sidebar.tsx`: 반응형 사이드바
- `actions/`: 서버 액션 (데이터 뮤테이션)
- `utils/supabase/`: 서버/클라이언트 Supabase 클라이언트 유틸

## 데이터베이스 스키마 매핑
데이터 통신 시 다음 컬럼명을 준수해야 합니다:

| 테이블 | 주요 컬럼 (필수 준수) |
| :--- | :--- |
| `students` | `id`, `name`, `student_no`, `enrollment_status` |
| `tests` | `id`, `title`, `subject` |
| `questions` | `id`, `test_id`, `question_no`, `correct_answer`, `points` |
| `student_answers` | `id`, `student_id`, `question_id`, `student_answer`, `is_correct`, `earned_points` |

## 핵심 워크플로우
- **데이터 조회**: `utils/supabase/server.ts`의 `createClient` 사용.
- **데이터 변경**: `actions/` 폴더 내의 서버 액션 사용 (`revalidatePath` 필수).
- **UI 패턴**: shadcn/ui 기반 컴포넌트를 사용하고 Tailwind로 레이아웃 구성.

## 향후 작업
1. 실제 Supabase 프로젝트 환경변수(`.env.local`) 설정 필요.
2. 대시보드의 `placeholder` 데이터를 실제 Supabase 쿼리로 교체.
3. 문제 수정/삭제 기능 구체화.
