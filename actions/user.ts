import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return session ? session.value : null;
}
