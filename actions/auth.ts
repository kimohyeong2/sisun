'use server';

import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createSessionToken } from '@/utils/session';

export async function login(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const pw = formData.get('pw') as string;

  if (!id || !pw) {
    return { error: '아이디와 비밀번호를 모두 입력해 주세요.' };
  }

  const supabase = await createClient();

  // 1. Teacher 조회
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('id, pw')
    .eq('id', id)
    .single();

  if (error || !teacher) {
    return { error: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  }

  // 2. 비밀번호 비교
  const isMatch = await bcrypt.compare(pw, teacher.pw);
  if (!isMatch) {
    return { error: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  }

  // 3. 세션 쿠키 설정 (평문 teacherId 대신 서명된 토큰을 저장해 위조를 방지)
  const token = await createSessionToken(teacher.id);
  const { cookies } = await import('next/headers');
  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // 4. 리다이렉트
  redirect('/students');
}

export async function logout() {
  const { cookies } = await import('next/headers');
  (await cookies()).delete('session');
  redirect('/login');
}
