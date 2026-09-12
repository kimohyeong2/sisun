const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET 환경 변수가 설정되지 않았습니다.');
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * teacherId를 서명해 위조 불가능한 세션 토큰을 생성합니다.
 * 쿠키 값 자체가 평문 teacherId가 아니므로 값 추측/조작으로는 로그인을 위조할 수 없습니다.
 */
export async function createSessionToken(teacherId: string): Promise<string> {
  const payload = toBase64Url(encoder.encode(teacherId));
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

/**
 * 세션 토큰의 서명을 검증하고, 유효하면 teacherId를 반환합니다.
 * 서명이 없거나 일치하지 않으면 null을 반환합니다 (미들웨어/서버 액션 양쪽에서 사용 가능한 Web Crypto 기반).
 */
export async function verifySessionToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const dot = token.indexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  try {
    const key = await getKey();
    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    if (!timingSafeEqual(toBase64Url(expectedSignature), signature)) return null;

    const teacherId = new TextDecoder().decode(
      Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
    );
    return teacherId || null;
  } catch {
    return null;
  }
}
