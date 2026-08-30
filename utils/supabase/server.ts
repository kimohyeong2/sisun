import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Next.js Server Component, Server Action, Route Handler에서
 * 안전하게 사용할 수 있는 Supabase 서버 클라이언트를 생성합니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 setAll이 호출되면 에러가 발생할 수 있습니다.
            // 미들웨어에서 세션을 갱신하도록 처리하는 경우 무시할 수 있습니다.
          }
        },
      },
    }
  );
}
