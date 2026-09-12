import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/utils/session';

/**
 * 서버 액션/서버 컴포넌트에서 호출. 서명된 세션 쿠키를 검증하고 teacherId를 반환합니다.
 * 세션이 없거나 위조된 경우 /login으로 리다이렉트합니다.
 *
 * 브라우저에서 Supabase anon key로 테이블을 직접 조회하면 미들웨어를 우회하므로,
 * 데이터에 접근하는 모든 서버 액션은 이 함수를 통해 별도로 인증을 재확인해야 합니다.
 */
export async function requireTeacherId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const teacherId = await verifySessionToken(token);

  if (!teacherId) {
    redirect('/login');
  }

  return teacherId;
}
