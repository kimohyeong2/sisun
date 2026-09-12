import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/utils/session';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 공개 경로 설정
  const isPublicPath = pathname === '/login';

  const teacherId = await verifySessionToken(sessionCookie);

  // 인증되지 않았고 공개 경로가 아닌 경우 로그인으로 리다이렉트
  if (!teacherId && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 인증되었고 로그인 페이지에 접근하려는 경우 학생 대시보드로 리다이렉트
  if (teacherId && isPublicPath) {
    return NextResponse.redirect(new URL('/students', request.url));
  }

  return NextResponse.next();
}

// 정적 파일(확장자가 있는 public/ 자산 포함) 등을 제외하고 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
