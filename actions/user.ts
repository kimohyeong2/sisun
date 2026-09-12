import { cookies } from 'next/headers';
import { verifySessionToken } from '@/utils/session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) return null;
  return verifySessionToken(session.value);
}
