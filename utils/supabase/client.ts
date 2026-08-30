import { createBrowserClient } from '@supabase/ssr';

/**
 * Next.js Client Component에서 안전하게 사용할 수 있는 Supabase 클라이언트(브라우저용)를 생성합니다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
