import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * 서버(Server Component / Server Action)에서만 사용하는 Supabase 클라이언트입니다.
 * Service role key를 사용하므로 RLS를 우회합니다 — 이 앱은 Supabase Auth 대신
 * `teachers` 테이블 기반 커스텀 로그인을 쓰기 때문에, 인가는 반드시 각 서버 액션의
 * `requireTeacherId()` 호출로 처리하고 이 클라이언트를 클라이언트 컴포넌트로 넘기면 안 됩니다.
 */
export async function createClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.');
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
