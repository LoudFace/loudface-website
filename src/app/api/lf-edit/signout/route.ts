import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/inline-edit/session';
import { PAUSED_COOKIE, editorOffResponse } from '@/lib/inline-edit/guard';

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;

  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(PAUSED_COOKIE);
  (await draftMode()).disable();
  redirect('/');
}
