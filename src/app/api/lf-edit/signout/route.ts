import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;

  (await cookies()).delete(SESSION_COOKIE);
  (await draftMode()).disable();
  redirect('/');
}
