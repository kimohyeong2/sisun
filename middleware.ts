import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // 공개 경로 설정
  const isPublicPath = pathname === '/login';

  // 인증되지 않았고 공개 경로가 아닌 경우 로그인으로 리다이렉트
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 인증되었고 로그인 페이지에 접근하려는 경우 학생 대시보드로 리다이렉트
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/students', request.url));
  }

  return NextResponse.next();
}

// 정적 파일 등을 제외하고 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
