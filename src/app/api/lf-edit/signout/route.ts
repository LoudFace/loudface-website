import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/inline-edit/session';

export async function GET() {
  (await cookies()).delete(SESSION_COOKIE);
  (await draftMode()).disable();
  redirect('/');
}
